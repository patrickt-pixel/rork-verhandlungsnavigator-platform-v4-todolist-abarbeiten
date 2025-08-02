import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DatabaseService } from '@/lib/supabase-service';
import { MOCK_MODE } from '@/lib/supabase';
import { COLORS } from '@/constants/colors';
import { Database, Wifi, WifiOff, RefreshCw } from 'lucide-react-native';

interface DatabaseStatusProps {
  showDetails?: boolean;
}

export const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ showDetails = false }) => {
  const [status, setStatus] = useState<{
    connected: boolean;
    loading: boolean;
    error?: string;
    stats?: any;
  }>({ connected: false, loading: true });

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await DatabaseService.initialize();
      
      if (result.success) {
        const stats = await DatabaseService.getStats();
        setStatus({
          connected: true,
          loading: false,
          stats
        });
      } else {
        setStatus({
          connected: false,
          loading: false,
          error: result.error
        });
      }
    } catch (error) {
      setStatus({
        connected: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleRetry = () => {
    checkConnection();
  };

  const showConnectionDetails = () => {
    const message = MOCK_MODE 
      ? 'App is running in Mock Mode.\n\nTo connect to Supabase:\n1. Set EXPO_PUBLIC_SUPABASE_URL\n2. Set EXPO_PUBLIC_SUPABASE_ANON_KEY\n3. Restart the app'
      : status.connected
        ? `Database Connected Successfully!\n\nStats:\n${JSON.stringify(status.stats, null, 2)}`
        : `Connection Failed: ${status.error || 'Unknown error'}`;
    
    Alert.alert('Database Status', message);
  };

  if (!showDetails) {
    return (
      <View style={styles.statusIndicator}>
        {status.loading ? (
          <RefreshCw size={16} color={COLORS.warning} />
        ) : status.connected ? (
          <Wifi size={16} color={COLORS.success} />
        ) : (
          <WifiOff size={16} color={COLORS.error} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Database size={20} color={COLORS.primary} />
        <Text style={styles.title}>Database Status</Text>
      </View>
      
      <View style={styles.statusRow}>
        <View style={styles.statusInfo}>
          {status.loading ? (
            <RefreshCw size={16} color={COLORS.warning} />
          ) : status.connected ? (
            <Wifi size={16} color={COLORS.success} />
          ) : (
            <WifiOff size={16} color={COLORS.error} />
          )}
          
          <Text style={[
            styles.statusText,
            { color: status.loading ? COLORS.warning : status.connected ? COLORS.success : COLORS.error }
          ]}>
            {status.loading ? 'Connecting...' : status.connected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={handleRetry}
          disabled={status.loading}
        >
          <RefreshCw size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {MOCK_MODE && (
        <Text style={styles.mockModeText}>
          Running in Mock Mode - Supabase not configured
        </Text>
      )}
      
      {status.error && (
        <Text style={styles.errorText}>
          Error: {status.error}
        </Text>
      )}
      
      {status.stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Database Stats:</Text>
          {Object.entries(status.stats).map(([key, value]) => (
            <Text key={key} style={styles.statItem}>
              {key}: {value}
            </Text>
          ))}
        </View>
      )}
      
      <TouchableOpacity style={styles.detailsButton} onPress={showConnectionDetails}>
        <Text style={styles.detailsButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusIndicator: {
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  retryButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  mockModeText: {
    fontSize: 12,
    color: COLORS.warning,
    fontStyle: 'italic',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 8,
  },
  statsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  statItem: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailsButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DatabaseStatus;