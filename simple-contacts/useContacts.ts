import { useState, useEffect, useCallback, useMemo } from 'react';
import * as db from './db';

export interface Contact {
  id?: number;
  name: string;
  phone: string;
  email: string;
  favorite: number;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load contacts từ database
  const loadContacts = useCallback(() => {
    try {
      const allContacts = db.getAllContacts();
      setContacts(allContacts);
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError('Không thể tải danh sách liên hệ');
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Thêm contact mới
  const addContact = useCallback((contact: Omit<Contact, 'id' | 'created_at'>) => {
    try {
      db.addContact(contact);
      loadContacts();
      return true;
    } catch (err) {
      console.error('Error adding contact:', err);
      setError('Không thể thêm liên hệ');
      return false;
    }
  }, [loadContacts]);

  // Cập nhật contact
  const updateContact = useCallback((id: number, contact: Partial<Contact>) => {
    try {
      db.updateContact(id, contact);
      loadContacts();
      return true;
    } catch (err) {
      console.error('Error updating contact:', err);
      setError('Không thể cập nhật liên hệ');
      return false;
    }
  }, [loadContacts]);

  // Toggle favorite
  const toggleFavorite = useCallback((id: number, currentFavorite: number) => {
    try {
      db.updateContact(id, { favorite: currentFavorite === 1 ? 0 : 1 });
      loadContacts();
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Không thể cập nhật yêu thích');
    }
  }, [loadContacts]);

  // Xóa contact
  const deleteContact = useCallback((id: number) => {
    try {
      db.deleteContact(id);
      loadContacts();
      return true;
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Không thể xóa liên hệ');
      return false;
    }
  }, [loadContacts]);

  // Import contacts từ API
  const importContactsFromAPI = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Sử dụng MockAPI
      const response = await fetch('https://672e0d0a229a881691ef6c33.mockapi.io/api/v1/contacts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const apiContacts = await response.json();
      let importedCount = 0;
      let skippedCount = 0;

      apiContacts.forEach((apiContact: any) => {
        const phone = apiContact.phone || apiContact.phoneNumber || '';
        
        // Kiểm tra phone đã tồn tại chưa
        if (phone && !db.phoneExists(phone)) {
          db.addContact({
            name: apiContact.name || apiContact.fullName || 'Unknown',
            phone: phone,
            email: apiContact.email || '',
            favorite: 0,
          });
          importedCount++;
        } else {
          skippedCount++;
        }
      });

      loadContacts();
      return { success: true, imported: importedCount, skipped: skippedCount };
    } catch (err) {
      console.error('Error importing contacts:', err);
      setError('Không thể import liên hệ từ API');
      return { success: false, imported: 0, skipped: 0 };
    } finally {
      setLoading(false);
    }
  }, [loadContacts]);

  // Filtered contacts với useMemo
  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    // Filter theo search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        contact =>
          contact.name.toLowerCase().includes(query) ||
          contact.phone.toLowerCase().includes(query)
      );
    }

    // Filter chỉ hiển thị favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter(contact => contact.favorite === 1);
    }

    return filtered;
  }, [contacts, searchQuery, showFavoritesOnly]);

  return {
    contacts: filteredContacts,
    allContacts: contacts,
    searchQuery,
    setSearchQuery,
    showFavoritesOnly,
    setShowFavoritesOnly,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    toggleFavorite,
    importContactsFromAPI,
    loadContacts,
  };
};