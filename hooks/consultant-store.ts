import createContextHook from '@nkzw/create-context-hook';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Consultant } from '@/types';
import { ConsultantService } from '@/lib/supabase-service';

// Mock data for demonstration (used when Supabase is not configured)
export const mockConsultants: Consultant[] = [
  {
    id: '2',
    email: 'sabine@example.com',
    name: 'Sabine Weber',
    role: 'consultant',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    bio: 'Experienced negotiation coach with 10+ years in corporate consulting. I specialize in helping sales teams close high-value deals and navigate complex negotiations.',
    expertise: ['Sales Negotiation', 'Conflict Resolution', 'Leadership'],
    hourlyRate: 120,
    rating: 4.8,
    reviewCount: 24,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'markus@example.com',
    name: 'Markus Schmidt',
    role: 'consultant',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
    bio: 'Former HR director with expertise in salary negotiations and workplace conflict resolution. I help professionals advocate for themselves effectively.',
    expertise: ['Salary Negotiation', 'Workplace Conflicts', 'Career Development'],
    hourlyRate: 95,
    rating: 4.6,
    reviewCount: 18,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    email: 'julia@example.com',
    name: 'Julia Becker',
    role: 'consultant',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    bio: 'International business consultant specializing in cross-cultural negotiations. I help companies navigate global partnerships and international deals.',
    expertise: ['International Business', 'Cross-Cultural Communication', 'Strategic Partnerships'],
    hourlyRate: 150,
    rating: 4.9,
    reviewCount: 31,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    email: 'thomas@example.com',
    name: 'Thomas Müller',
    role: 'consultant',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    bio: 'Legal expert with focus on contract negotiations and dispute resolution. I provide strategic advice for complex legal negotiations.',
    expertise: ['Contract Negotiation', 'Legal Disputes', 'Mediation'],
    hourlyRate: 135,
    rating: 4.7,
    reviewCount: 22,
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    email: 'anna@example.com',
    name: 'Anna Hoffmann',
    role: 'consultant',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    bio: 'Communication coach specializing in difficult conversations. I help individuals and teams improve their communication in high-stakes situations.',
    expertise: ['Difficult Conversations', 'Communication Skills', 'Team Dynamics'],
    hourlyRate: 110,
    rating: 4.5,
    reviewCount: 15,
    createdAt: new Date().toISOString(),
  },
];

interface ConsultantState {
  consultants: Consultant[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedExpertise: string | null;
  setSearchTerm: (term: string) => void;
  setSelectedExpertise: (expertise: string | null) => void;
  getConsultantById: (id: string) => Consultant | undefined;
  filteredConsultants: Consultant[];
  expertiseOptions: string[];
}

export const [ConsultantProvider, useConsultants] = createContextHook<ConsultantState>(() => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedExpertise, setSelectedExpertise] = useState<string | null>(null);

  const { data: consultants = [], isLoading, error } = useQuery({
    queryKey: ['consultants'],
    queryFn: async () => {
      const { data, error } = await ConsultantService.getConsultants();
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch consultants');
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Extract all unique expertise areas
  const expertiseOptions = Array.from(
    new Set(consultants.flatMap(consultant => consultant.expertise))
  ).sort();

  // Filter consultants based on search term and selected expertise
  const filteredConsultants = consultants.filter(consultant => {
    const matchesSearch = searchTerm === '' || 
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.bio.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesExpertise = selectedExpertise === null || 
      consultant.expertise.includes(selectedExpertise);
    
    return matchesSearch && matchesExpertise;
  });

  const getConsultantById = (id: string) => {
    return consultants.find(consultant => consultant.id === id);
  };

  return {
    consultants,
    isLoading,
    error: error ? String(error) : null,
    searchTerm,
    selectedExpertise,
    setSearchTerm,
    setSelectedExpertise,
    getConsultantById,
    filteredConsultants,
    expertiseOptions,
  };
});