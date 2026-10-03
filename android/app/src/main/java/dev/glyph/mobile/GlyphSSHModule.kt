package dev.glyph.mobile

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.jcraft.jsch.*
import java.io.*
import java.nio.charset.StandardCharsets
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledExecutorService
import java.util.concurrent.TimeUnit

class GlyphSSHModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val jsch = JSch()
    private var session: Session? = null
    private var isConnected = false
    private val shellChannels = ConcurrentHashMap<String, ChannelShell>()
    private val shellOutputStreams = ConcurrentHashMap<String, OutputStream>()
    private var sftpChannel: ChannelSftp? = null
    private var statScheduler: ScheduledExecutorService? = null
    private val executor = Executors.newCachedThreadPool()

    override fun getName(): String = "GlyphSSH"

    private fun sendEvent(eventName: String, params: Any?) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN built-in EventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN built-in EventEmitter
    }

    @ReactMethod
    fun connect(config: ReadableMap, promise: Promise) {
        executor.execute {
            try {
                // Disconnect previous session if any
                cleanupSession()

                val host = config.getString("host") ?: throw IllegalArgumentException("Host is required")
                val port = if (config.hasKey("port") && !config.isNull("port")) config.getInt("port") else 22
                val username = config.getString("username") ?: "root"
                val password = if (config.hasKey("password") && !config.isNull("password")) config.getString("password") else null
                val privateKey = if (config.hasKey("privateKey") && !config.isNull("privateKey")) config.getString("privateKey") else null
                val passphrase = if (config.hasKey("passphrase") && !config.isNull("passphrase")) config.getString("passphrase") else null

                // Handle Private Key Authentication
                if (!privateKey.isNullOrEmpty()) {
                    try {
                        val keyBytes = privateKey.trim().toByteArray(StandardCharsets.UTF_8)
                        val passBytes = passphrase?.toByteArray(StandardCharsets.UTF_8)
                        jsch.addIdentity("key_${System.currentTimeMillis()}", keyBytes, null, passBytes)
                    } catch (e: Exception) {
                        // If it's a file path
                        if (File(privateKey).exists()) {
                            jsch.addIdentity(privateKey, passphrase)
                        } else {
                            throw e
                        }
                    }
                }

                val newSession = jsch.getSession(username, host, port)
                if (!password.isNullOrEmpty()) {
                    newSession.setPassword(password)
                }

                val sessionConfig = java.util.Properties()
                sessionConfig["StrictHostKeyChecking"] = "no"
                sessionConfig["PreferredAuthentications"] = "publickey,password,keyboard-interactive"
                newSession.setConfig(sessionConfig)
                newSession.timeout = 15000

                newSession.connect(15000)
                session = newSession
                isConnected = true

                // Detect OS
                var detectedOs = "linux"
                try {
                    val osOutput = executeSync(
                        "if [ -f /etc/openwrt_release ]; then echo openwrt; " +
                        "elif [ -f /etc/os-release ]; then grep '^ID=' /etc/os-release 2>/dev/null | head -1 | cut -d= -f2 | tr -d '\"'; " +
                        "elif [ -f /etc/alpine-release ]; then echo alpine; " +
                        "elif [ -f /etc/gentoo-release ]; then echo gentoo; " +
                        "elif [ -f /etc/freebsd-version ] || uname -s 2>/dev/null | grep -qi freebsd; then echo freebsd; " +
                        "else uname -s 2>/dev/null | tr '[:upper:]' '[:lower:]'; fi"
                    )
                    if (!osOutput.isNullOrEmpty()) {
                        detectedOs = osOutput.trim().lowercase().split("\n")[0]
                    }
                } catch (e: Exception) {
                    // Ignore OS detection fallback
                }

                val res = Arguments.createMap()
                res.putBoolean("success", true)
                res.putString("os", detectedOs)
                promise.resolve(res)

            } catch (e: Exception) {
                cleanupSession()
                promise.reject("SSH_CONNECT_ERROR", e.message ?: "Failed to connect to SSH server", e)
            }
        }
    }

    @ReactMethod
    fun disconnect(promise: Promise) {
        executor.execute {
            cleanupSession()
            val res = Arguments.createMap()
            res.putBoolean("success", true)
            promise.resolve(res)
        }
    }

    private fun cleanupSession() {
        try {
            stopStatPollingInternal()
            for ((tabId, ch) in shellChannels) {
                try { ch.disconnect() } catch (_: Exception) {}
            }
            shellChannels.clear()
            shellOutputStreams.clear()

            sftpChannel?.let {
                try { it.disconnect() } catch (_: Exception) {}
            }
            sftpChannel = null

            session?.let {
                try { it.disconnect() } catch (_: Exception) {}
            }
            session = null
            isConnected = false
        } catch (_: Exception) {}
    }

    @ReactMethod
    fun exec(command: String, promise: Promise) {
        executor.execute {
            try {
                val currentSession = session ?: throw IllegalStateException("SSH not connected")
                if (!currentSession.isConnected) throw IllegalStateException("SSH session closed")

                val output = executeSync(command)
                promise.resolve(output)
            } catch (e: Exception) {
                promise.reject("SSH_EXEC_ERROR", e.message ?: "Command execution failed", e)
            }
        }
    }

    private fun executeSync(command: String): String {
        val currentSession = session ?: throw IllegalStateException("SSH not connected")
        val channel = currentSession.openChannel("exec") as ChannelExec
        channel.setCommand(command)
        channel.inputStream = null
        val stdout = channel.inputStream
        val stderr = channel.errStream

        channel.connect(10000)

        val output = StringBuilder()
        val buffer = ByteArray(4096)

        val reader = BufferedReader(InputStreamReader(stdout, StandardCharsets.UTF_8))
        var line: String?
        while (reader.readLine().also { line = it } != null) {
            output.append(line).append("\n")
        }

        val errReader = BufferedReader(InputStreamReader(stderr, StandardCharsets.UTF_8))
        while (errReader.readLine().also { line = it } != null) {
            output.append(line).append("\n")
        }

        channel.disconnect()
        return output.toString()
    }

    @ReactMethod
    fun openShell(tabId: String, promise: Promise) {
        executor.execute {
            try {
                val currentSession = session ?: throw IllegalStateException("SSH not connected")
                if (!currentSession.isConnected) throw IllegalStateException("SSH session closed")

                // Close existing shell for tabId if present
                shellChannels[tabId]?.let {
                    try { it.disconnect() } catch (_: Exception) {}
                }

                val channel = currentSession.openChannel("shell") as ChannelShell
                channel.setPtyType("xterm-256color")
                channel.setPtySize(80, 24, 640, 480)

                val outStream = channel.outputStream
                val inStream = channel.inputStream

                channel.connect(10000)
                shellChannels[tabId] = channel
                shellOutputStreams[tabId] = outStream

                // Background thread to stream PTY output to React Native
                executor.execute {
                    val buf = ByteArray(4096)
                    try {
                        var len = inStream.read(buf)
                        while (channel.isConnected && len != -1) {
                            if (len > 0) {
                                val chunk = String(buf, 0, len, StandardCharsets.UTF_8)
                                val params = Arguments.createMap()
                                params.putString("tabId", tabId)
                                params.putString("data", chunk)
                                sendEvent("ssh-shell-output-tab", params)
                            }
                            len = inStream.read(buf)
                        }
                    } catch (_: Exception) {
                    } finally {
                        val closeParams = Arguments.createMap()
                        closeParams.putString("tabId", tabId)
                        sendEvent("ssh-shell-closed", closeParams)
                    }
                }

                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SSH_SHELL_ERROR", e.message ?: "Failed to open shell", e)
            }
        }
    }

    @ReactMethod
    fun writeShell(tabId: String, data: String) {
        executor.execute {
            try {
                shellOutputStreams[tabId]?.let { stream ->
                    stream.write(data.toByteArray(StandardCharsets.UTF_8))
                    stream.flush()
                }
            } catch (_: Exception) {}
        }
    }

    @ReactMethod
    fun resizeShell(tabId: String, cols: Int, rows: Int) {
        executor.execute {
            try {
                shellChannels[tabId]?.setPtySize(cols, rows, cols * 8, rows * 16)
            } catch (_: Exception) {}
        }
    }

    @ReactMethod
    fun closeShell(tabId: String) {
        executor.execute {
            try {
                shellChannels[tabId]?.disconnect()
                shellChannels.remove(tabId)
                shellOutputStreams.remove(tabId)
            } catch (_: Exception) {}
        }
    }

    // ── Real SFTP Operations ──────────────────────────────────────────────────
    private fun getOrInitSftp(): ChannelSftp {
        val currentSession = session ?: throw IllegalStateException("SSH not connected")
        if (sftpChannel == null || !sftpChannel!!.isConnected) {
            val channel = currentSession.openChannel("sftp") as ChannelSftp
            channel.connect(10000)
            sftpChannel = channel
        }
        return sftpChannel!!
    }

    @ReactMethod
    fun sftpReaddir(path: String, promise: Promise) {
        executor.execute {
            try {
                val sftp = getOrInitSftp()
                val list = sftp.ls(path)
                val result = Arguments.createArray()

                for (item in list) {
                    if (item is ChannelSftp.LsEntry) {
                        val filename = item.filename
                        if (filename == "." || filename == "..") continue

                        val map = Arguments.createMap()
                        map.putString("name", filename)
                        map.putBoolean("isDirectory", item.attrs.isDir)
                        map.putString("type", if (item.attrs.isDir) "directory" else "file")
                        map.putDouble("size", item.attrs.size.toDouble())
                        map.putDouble("modifyTime", item.attrs.mTime.toDouble() * 1000)
                        map.putString("permissions", item.attrs.permissionsString)
                        result.pushMap(map)
                    }
                }
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("SFTP_READDIR_ERROR", e.message ?: "Failed to list directory", e)
            }
        }
    }

    @ReactMethod
    fun sftpReadFile(path: String, promise: Promise) {
        executor.execute {
            try {
                val sftp = getOrInitSftp()
                val outputStream = ByteArrayOutputStream()
                sftp.get(path, outputStream)
                val content = outputStream.toString("UTF-8")
                promise.resolve(content)
            } catch (e: Exception) {
                promise.reject("SFTP_READ_ERROR", e.message ?: "Failed to read file", e)
            }
        }
    }

    @ReactMethod
    fun sftpWriteFile(path: String, content: String, promise: Promise) {
        executor.execute {
            try {
                val sftp = getOrInitSftp()
                val inputStream = ByteArrayInputStream(content.toByteArray(StandardCharsets.UTF_8))
                sftp.put(inputStream, path, ChannelSftp.OVERWRITE)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SFTP_WRITE_ERROR", e.message ?: "Failed to write file", e)
            }
        }
    }

    @ReactMethod
    fun sftpDownloadFile(remotePath: String, localPath: String, promise: Promise) {
        executor.execute {
            try {
                val sftp = getOrInitSftp()
                val targetFile = File(localPath)
                targetFile.parentFile?.mkdirs()
                val fos = FileOutputStream(targetFile)
                sftp.get(remotePath, fos)
                fos.flush()
                fos.close()
                promise.resolve(targetFile.absolutePath)
            } catch (e: Exception) {
                promise.reject("SFTP_DOWNLOAD_ERROR", e.message ?: "Failed to download file", e)
            }
        }
    }

    @ReactMethod
    fun sftpUploadFile(localPath: String, remotePath: String, promise: Promise) {
        executor.execute {
            try {
                val sftp = getOrInitSftp()
                val localFile = File(localPath)
                if (!localFile.exists()) {
                    throw FileNotFoundException("Local file not found: $localPath")
                }
                val fis = FileInputStream(localFile)
                sftp.put(fis, remotePath, ChannelSftp.OVERWRITE)
                fis.close()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SFTP_UPLOAD_ERROR", e.message ?: "Failed to upload file", e)
            }
        }
    }

    @ReactMethod
    fun sftpDelete(path: String, isDirectory: Boolean, promise: Promise) {
        executor.execute {
            try {
                val sftp = getOrInitSftp()
                if (isDirectory) {
                    sftp.rmdir(path)
                } else {
                    sftp.rm(path)
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SFTP_DELETE_ERROR", e.message ?: "Failed to delete item", e)
            }
        }
    }

    @ReactMethod
    fun sftpMkdir(path: String, promise: Promise) {
        executor.execute {
            try {
                val sftp = getOrInitSftp()
                sftp.mkdir(path)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SFTP_MKDIR_ERROR", e.message ?: "Failed to create directory", e)
            }
        }
    }

    @ReactMethod
    fun sftpRename(oldPath: String, newPath: String, promise: Promise) {
        executor.execute {
            try {
                val sftp = getOrInitSftp()
                sftp.rename(oldPath, newPath)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SFTP_RENAME_ERROR", e.message ?: "Failed to rename item", e)
            }
        }
    }

    // ── Real Live Stat Polling (Exact Desktop Glyph Script) ───────────────────
    private val prevNetBytes = ConcurrentHashMap<String, Pair<Long, Long>>() // iface -> (rx, tx)
    private val prevCpuStats = ConcurrentHashMap<String, LongArray>() // name -> [user, nice, sys, idle, iow, irq, sirq]
    private var lastPollTime = System.currentTimeMillis()

    @ReactMethod
    fun startStatPolling(intervalMs: Int) {
        stopStatPollingInternal()
        val period = if (intervalMs >= 1000) intervalMs.toLong() else 3000L
        lastPollTime = System.currentTimeMillis()
        prevNetBytes.clear()
        prevCpuStats.clear()

        statScheduler = Executors.newSingleThreadScheduledExecutor()
        statScheduler?.scheduleAtFixedRate({
            if (!isConnected || session == null || !session!!.isConnected) return@scheduleAtFixedRate

            try {
                val now = System.currentTimeMillis()
                val elapsed = Math.max(1.0, (now - lastPollTime) / 1000.0)
                lastPollTime = now

                val bashCmd = (
                    "top -b -n 1 | head -n 8\n" +
                    "echo '===GLYPH_DELIMITER==='\n" +
                    "free -m\n" +
                    "echo '===GLYPH_DELIMITER==='\n" +
                    "df -h --output=source,size,used,avail,pcent,target 2>/dev/null || df -h\n" +
                    "echo '===GLYPH_DELIMITER==='\n" +
                    "uptime -p 2>/dev/null || cat /proc/uptime 2>/dev/null\n" +
                    "echo '===GLYPH_DELIMITER==='\n" +
                    "who | awk '{print \$1}' | sort -u | wc -l\n" +
                    "echo '===GLYPH_DELIMITER==='\n" +
                    "awk 'NR>2{print \$1,\$2,\$10}' /proc/net/dev 2>/dev/null\n" +
                    "echo '===GLYPH_DELIMITER==='\n" +
                    "grep '^cpu' /proc/stat 2>/dev/null\n" +
                    "echo '===GLYPH_DELIMITER==='\n" +
                    "sensors 2>/dev/null || true\n" +
                    "echo '===GLYPH_DELIMITER==='\n" +
                    "paste <(ls /sys/class/thermal/thermal_zone*/type 2>/dev/null) <(cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null) 2>/dev/null | awk '{type=\$1; val=\$2; printf \"%s %dC\\n\", type, val/1000}' | head -8\n" +
                    "echo '===GLYPH_DELIMITER==='\n" +
                    "if command -v nvidia-smi >/dev/null 2>&1; then\n" +
                    "  nvidia-smi --query-gpu=index,name,utilization.gpu,temperature.gpu,memory.total,memory.used --format=csv,noheader 2>/dev/null | sed 's/ MiB//g; s/ %//g'\n" +
                    "else\n" +
                    "  idx=0\n" +
                    "  found=0\n" +
                    "  for card in /sys/class/drm/card[0-9]*; do\n" +
                    "    if [ -d \"\$card\" ]; then\n" +
                    "      vendor=\$(cat \"\$card/device/vendor\" 2>/dev/null)\n" +
                    "      if [ \"\$vendor\" = \"0x1002\" ]; then\n" +
                    "        util=\$(cat \"\$card/device/gpu_busy_percent\" 2>/dev/null || echo \"0\")\n" +
                    "        temp_input=\$(cat \"\$card/device/hwmon/hwmon\"*/temp1_input 2>/dev/null | head -n1 || echo \"0\")\n" +
                    "        temp=\$((temp_input / 1000))\n" +
                    "        mem_total=\$(cat \"\$card/device/mem_info_vram_total\" 2>/dev/null || echo \"0\")\n" +
                    "        mem_used=\$(cat \"\$card/device/mem_info_vram_used\" 2>/dev/null || echo \"0\")\n" +
                    "        echo \"\$idx, AMD GPU, \$util, \$temp, \$((mem_total/1024/1024)), \$((mem_used/1024/1024))\"\n" +
                    "        idx=\$((idx+1))\n" +
                    "        found=1\n" +
                    "      elif [ \"\$vendor\" = \"0x8086\" ]; then\n" +
                    "        echo \"\$idx, Intel GPU, 0, 0, 0, 0\"\n" +
                    "        idx=\$((idx+1))\n" +
                    "        found=1\n" +
                    "      fi\n" +
                    "    fi\n" +
                    "  done\n" +
                    "  if [ \$found -eq 0 ]; then echo \"NO_GPU\"; fi\n" +
                    "fi\n" +
                    "echo '===GLYPH_DELIMITER==='\n" +
                    "uname -srm 2>/dev/null || uname -a 2>/dev/null\n"
                )

                val rawOutput = executeSync(bashCmd)
                val parts = rawOutput.split("===GLYPH_DELIMITER===").map { it.trim() }

                val topOutput = if (parts.isNotEmpty()) parts[0] else ""
                val freeOutput = if (parts.size > 1) parts[1] else ""
                val dfOutput = if (parts.size > 2) parts[2] else ""
                val uptimeOutput = if (parts.size > 3) parts[3] else ""
                val usersOutput = if (parts.size > 4) parts[4] else ""
                val rawNetLines = if (parts.size > 5) parts[5] else ""
                val statRaw = if (parts.size > 6) parts[6] else ""
                val sensorsRaw = if (parts.size > 7) parts[7] else ""
                val tzTemps = if (parts.size > 8) parts[8] else ""
                val gpuRaw = if (parts.size > 9) parts[9] else ""
                val unameRaw = if (parts.size > 10) parts[10] else ""

                // 1. Network Speed Deltas
                val currentNetBytes = HashMap<String, Pair<Long, Long>>()
                val speedLines = StringBuilder()
                var totalRxSpeed = 0.0
                var totalTxSpeed = 0.0

                if (rawNetLines.isNotEmpty()) {
                    for (line in rawNetLines.lines()) {
                        val p = line.trim().split(Regex("\\s+")).filter { it.isNotEmpty() }
                        if (p.size >= 3) {
                            val iface = p[0].replace(":", "")
                            val rx = p[1].toLongOrNull() ?: 0L
                            val tx = p[2].toLongOrNull() ?: 0L
                            currentNetBytes[iface] = Pair(rx, tx)

                            val prev = prevNetBytes[iface]
                            val rxSpeed = if (prev != null) Math.max(0.0, (rx - prev.first) / elapsed) else 0.0
                            val txSpeed = if (prev != null) Math.max(0.0, (tx - prev.second) / elapsed) else 0.0
                            totalRxSpeed += rxSpeed
                            totalTxSpeed += txSpeed
                            speedLines.append("$iface RX:$rx TX:$tx RXS:${rxSpeed.toLong()} TXS:${txSpeed.toLong()}\n")
                        }
                    }
                }
                prevNetBytes.clear()
                prevNetBytes.putAll(currentNetBytes)

                // 2. CPU Usage & Per-Core Deltas
                var totalCpuPct = 0.0
                val coreLines = StringBuilder()
                var coreCount = 0

                if (statRaw.isNotEmpty()) {
                    for (line in statRaw.lines()) {
                        val p = line.trim().split(Regex("\\s+")).filter { it.isNotEmpty() }
                        if (p.isEmpty()) continue
                        val name = p[0]
                        if (!name.matches(Regex("^cpu\\d*$"))) continue

                        val user = p.getOrNull(1)?.toLongOrNull() ?: 0L
                        val nice = p.getOrNull(2)?.toLongOrNull() ?: 0L
                        val sys = p.getOrNull(3)?.toLongOrNull() ?: 0L
                        val idle = p.getOrNull(4)?.toLongOrNull() ?: 0L
                        val iow = p.getOrNull(5)?.toLongOrNull() ?: 0L
                        val irq = p.getOrNull(6)?.toLongOrNull() ?: 0L
                        val sirq = p.getOrNull(7)?.toLongOrNull() ?: 0L
                        val current = longArrayOf(user, nice, sys, idle, iow, irq, sirq)

                        val prev = prevCpuStats[name]
                        if (prev != null) {
                            val dIdle = (idle + iow) - (prev[3] + prev[4])
                            val dTotal = (user + nice + sys + idle + iow + irq + sirq) -
                                    (prev[0] + prev[1] + prev[2] + prev[3] + prev[4] + prev[5] + prev[6])
                            val pct = if (dTotal > 0) Math.max(0.0, Math.min(100.0, ((dTotal - dIdle).toDouble() / dTotal.toDouble()) * 100.0)) else 0.0

                            if (name == "cpu") {
                                totalCpuPct = pct
                            } else {
                                coreCount++
                                coreLines.append("$name ${String.format(java.util.Locale.US, "%.1f", pct)}\n")
                            }
                        } else {
                            if (name != "cpu") {
                                coreCount++
                                coreLines.append("$name 0.0\n")
                            }
                        }
                        prevCpuStats[name] = current
                    }
                }

                // Fallback CPU from top if /proc/stat had no delta yet
                if (totalCpuPct <= 0.0 && (topOutput.contains("Cpu(s):") || topOutput.contains("%Cpu"))) {
                    val line = topOutput.lines().firstOrNull { it.contains("Cpu") } ?: ""
                    val match = Regex("""([0-9.]+)\s*(?:%?\s*)id""").find(line)
                    if (match != null) {
                        val idle = match.groupValues[1].toDoubleOrNull() ?: 100.0
                        totalCpuPct = (100.0 - idle).coerceIn(0.0, 100.0)
                    }
                }

                // 3. Parse Memory
                var memTotal = 0.0
                var memUsed = 0.0
                var memPercent = 0.0
                if (freeOutput.isNotEmpty()) {
                    val memLine = freeOutput.lines().firstOrNull { it.startsWith("Mem:") }
                    if (memLine != null) {
                        val tokens = memLine.split(Regex("""\s+""")).filter { it.isNotEmpty() }
                        if (tokens.size >= 3) {
                            memTotal = (tokens[1].toDoubleOrNull() ?: 1.0) * 1024 * 1024
                            memUsed = (tokens[2].toDoubleOrNull() ?: 0.0) * 1024 * 1024
                            memPercent = if (memTotal > 0) ((memUsed / memTotal) * 100.0).coerceIn(0.0, 100.0) else 0.0
                        }
                    }
                }

                // 4. Parse Disk Usage (lines[1] for exact parity with Desktop Dashboard.jsx)
                var diskPercent = 0.0
                val diskList = Arguments.createArray()
                if (dfOutput.isNotEmpty()) {
                    val lines = dfOutput.lines().filter { it.trim().isNotEmpty() }
                    if (lines.size > 1) {
                        val row1 = lines[1].trim().split(Regex("""\s+""")).filter { it.isNotEmpty() }
                        diskPercent = row1.firstOrNull { it.endsWith("%") }?.replace("%", "")?.toDoubleOrNull()
                            ?: (if (row1.size > 4) row1[4].replace("%", "").toDoubleOrNull() else 0.0) ?: 0.0
                    }
                    for (i in 1 until lines.size) {
                        val row = lines[i].trim().split(Regex("""\s+""")).filter { it.isNotEmpty() }
                        if (row.size >= 5) {
                            val pcent = row.firstOrNull { it.endsWith("%") }?.replace("%", "")?.toDoubleOrNull() ?: 0.0
                            val mount = row.last()
                            val diskMap = Arguments.createMap()
                            diskMap.putString("filesystem", row[0])
                            diskMap.putString("size", if (row.size > 1) row[1] else "")
                            diskMap.putString("used", if (row.size > 2) row[2] else "")
                            diskMap.putString("avail", if (row.size > 3) row[3] else "")
                            diskMap.putDouble("pcent", pcent)
                            diskMap.putString("mount", mount)
                            diskList.pushMap(diskMap)
                        }
                    }
                }

                // 5. Parse GPU stats
                var gpuAvg: Double? = null
                if (gpuRaw.isNotEmpty()) {
                    if (gpuRaw.trim() == "NO_GPU") {
                        gpuAvg = -1.0
                    } else {
                        var total = 0.0
                        var count = 0
                        for (l in gpuRaw.lines()) {
                            val parts = l.split(", ")
                            if (parts.size >= 3) {
                                val util = parts[2].toDoubleOrNull() ?: 0.0
                                total += util
                                count++
                            }
                        }
                        if (count > 0) gpuAvg = total / count.toDouble()
                    }
                }

                // Temperature
                val tempText = if (sensorsRaw.isNotEmpty() && !sensorsRaw.contains("No sensors found")) sensorsRaw else tzTemps

                val metrics = Arguments.createMap()
                metrics.putString("top", topOutput)
                metrics.putString("free", freeOutput)
                metrics.putString("df", dfOutput)
                metrics.putString("uptime", uptimeOutput)
                metrics.putString("users", usersOutput)
                metrics.putString("net", speedLines.toString().trim())
                metrics.putString("cores", coreLines.toString().trim())
                metrics.putString("temp", tempText)
                metrics.putString("gpuRaw", gpuRaw)
                metrics.putString("kernel", unameRaw)
                metrics.putInt("coreCount", if (coreCount > 0) coreCount else 1)

                metrics.putDouble("cpu", Math.round(totalCpuPct).toDouble())
                metrics.putDouble("ram", Math.round(memPercent).toDouble())
                metrics.putDouble("ramTotal", memTotal)
                metrics.putDouble("ramUsed", memUsed)
                metrics.putDouble("disk", Math.round(diskPercent).toDouble())
                metrics.putDouble("gpu", gpuAvg ?: -1.0)
                metrics.putArray("diskList", diskList)
                metrics.putDouble("rxSpeed", totalRxSpeed)
                metrics.putDouble("txSpeed", totalTxSpeed)
                metrics.putString("uptimeStr", uptimeOutput)
                metrics.putInt("usersCount", usersOutput.trim().toIntOrNull() ?: 1)

                sendEvent("ssh-stats", metrics)
            } catch (_: Exception) {}
        }, 0, period, TimeUnit.MILLISECONDS)
    }

    private fun stopStatPollingInternal() {
        try {
            statScheduler?.shutdownNow()
            statScheduler = null
        } catch (_: Exception) {}
    }

    @ReactMethod
    fun stopStatPolling() {
        stopStatPollingInternal()
    }

    @ReactMethod
    fun startTunnel(localPort: Int, remoteHost: String, remotePort: Int, promise: Promise) {
        executor.execute {
            try {
                val currentSession = session ?: throw IllegalStateException("SSH not connected")
                currentSession.setPortForwardingL(localPort, remoteHost, remotePort)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SSH_TUNNEL_ERROR", e.message ?: "Failed to start tunnel", e)
            }
        }
    }

    @ReactMethod
    fun stopTunnel(localPort: Int, promise: Promise) {
        executor.execute {
            try {
                val currentSession = session ?: throw IllegalStateException("SSH not connected")
                currentSession.delPortForwardingL(localPort)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SSH_TUNNEL_ERROR", e.message ?: "Failed to stop tunnel", e)
            }
        }
    }
}
