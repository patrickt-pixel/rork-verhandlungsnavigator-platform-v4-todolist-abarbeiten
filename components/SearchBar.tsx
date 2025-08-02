import React from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { COLORS } from '../constants/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  testID?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value,
  onChangeText,
  placeholder = 'Berater suchen...',
  testID 
}) => {
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.container} testID={testID}>
      <Search size={20} color={COLORS.textLight} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X size={18} color={COLORS.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    height: 48,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
});