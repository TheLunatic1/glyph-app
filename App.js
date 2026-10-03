// Glyph Mobile - Root App Component
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import ServerListScreen from './src/screens/ServerListScreen';
import ServerDetailScreen from './src/screens/ServerDetailScreen';
import AddEditServerModal from './src/screens/AddEditServerModal';
import SettingsScreen from './src/screens/SettingsScreen';
import ExportModal from './src/screens/ExportModal';
import ImportModal from './src/screens/ImportModal';
import ConnectingModal from './src/components/ConnectingModal';
import BiometricLockView from './src/components/BiometricLockView';
import {
  getServers,
  saveServer,
  deleteServer,
  getSettings
} from './src/services/vaultStorage';

export default function App() {
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [connectingServer, setConnectingServer] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('list'); // 'list' | 'detail' | 'settings'
  const [isLocked, setIsLocked] = useState(false);
  
  // Modals
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const loadedServers = await getServers();
    setServers(loadedServers);

    const settings = await getSettings();
    if (settings.isLocked && settings.masterPinHash) {
      setIsLocked(true);
    }
  };

  const refreshServers = async () => {
    const loaded = await getServers();
    setServers(loaded);
  };

  // Server management actions
  const handleSaveServer = async (serverData) => {
    const updated = await saveServer(serverData);
    setServers(updated);
    if (selectedServer && selectedServer.id === serverData.id) {
      setSelectedServer({ ...selectedServer, ...serverData });
    }
  };

  const handleDeleteServer = async (id) => {
    const updated = await deleteServer(id);
    setServers(updated);
    if (selectedServer && selectedServer.id === id) {
      setSelectedServer(null);
      setCurrentScreen('list');
    }
  };

  const handleStartConnect = (server) => {
    setConnectingServer(server);
  };

  const handleConnectionComplete = (updatedServer) => {
    setConnectingServer(null);
    setSelectedServer(updatedServer);
    setCurrentScreen('detail');
    refreshServers();
  };

  // If app is locked, present BiometricLockView
  if (isLocked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ExpoStatusBar style="light" />
        <BiometricLockView onUnlocked={() => setIsLocked(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />
      <View style={styles.container}>
        {/* Navigation Router */}
        {currentScreen === 'list' && (
          <ServerListScreen
            servers={servers}
            onSelectServer={handleStartConnect}
            onAddServer={() => {
              setEditingServer(null);
              setServerModalVisible(true);
            }}
            onEditServer={(target) => {
              setEditingServer(target);
              setServerModalVisible(true);
            }}
            onDeleteServer={handleDeleteServer}
            onOpenSettings={() => setCurrentScreen('settings')}
            onOpenImport={() => setImportModalVisible(true)}
            onOpenExport={() => setExportModalVisible(true)}
          />
        )}

        {currentScreen === 'detail' && selectedServer && (
          <ServerDetailScreen
            server={selectedServer}
            onBack={() => {
              setSelectedServer(null);
              setCurrentScreen('list');
              refreshServers();
            }}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            onBack={() => setCurrentScreen('list')}
            onOpenExport={() => setExportModalVisible(true)}
            onOpenImport={() => setImportModalVisible(true)}
          />
        )}

        {/* Global Modals */}
        <ConnectingModal
          visible={!!connectingServer}
          server={connectingServer}
          onConnected={handleConnectionComplete}
          onCancel={() => setConnectingServer(null)}
        />

        <AddEditServerModal
          visible={serverModalVisible}
          server={editingServer}
          onSave={handleSaveServer}
          onClose={() => setServerModalVisible(false)}
        />

        <ExportModal
          visible={exportModalVisible}
          servers={servers}
          onClose={() => setExportModalVisible(false)}
        />

        <ImportModal
          visible={importModalVisible}
          onImportSuccess={(newServers) => {
            setServers(newServers);
            setImportModalVisible(false);
          }}
          onClose={() => setImportModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0d14',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0d14',
  }
});
