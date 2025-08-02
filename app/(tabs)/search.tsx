import React, { useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { useConsultants } from '@/hooks/consultant-store';
import { ConsultantCard } from '@/components/ConsultantCard';
import { SearchBar } from '@/components/SearchBar';
import { ExpertiseFilter } from '@/components/ExpertiseFilter';
import { EmptyState } from '@/components/EmptyState';
import { COLORS } from '@/constants/colors';
import { Search as SearchIcon } from 'lucide-react-native';

export default function SearchScreen() {
  const { 
    filteredConsultants, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    selectedExpertise, 
    setSelectedExpertise,
    expertiseOptions
  } = useConsultants();

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Berater oder Fachgebiet suchen..."
        testID="search-input"
      />

      <ExpertiseFilter
        options={expertiseOptions}
        selectedOption={selectedExpertise}
        onSelect={setSelectedExpertise}
        testID="expertise-filter"
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filteredConsultants.length > 0 ? (
        <FlatList
          data={filteredConsultants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ConsultantCard consultant={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title="Keine Berater gefunden"
          message={
            searchTerm || selectedExpertise
              ? "Versuchen Sie es mit anderen Suchbegriffen oder Filtern."
              : "Es sind derzeit keine Berater verfügbar."
          }
          icon={<SearchIcon size={40} color={COLORS.textLighter} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});