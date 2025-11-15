import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { initDatabase } from './db';
import { useContacts, Contact } from './useContacts';
import { ContactModal } from './ContactModal';
import { ContactItem } from './ContactItem';

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const {
    contacts,
    allContacts,
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
  } = useContacts();

  useEffect(() => {
    initDatabase();
  }, []);

  const handleAddContact = () => {
    setEditingContact(null);
    setModalVisible(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setModalVisible(true);
  };

  const handleSaveContact = (contact: Omit<Contact, 'id'>) => {
    if (editingContact) {
      updateContact(editingContact.id!, contact);
    } else {
      addContact(contact);
    }
  };

  const handleImportContacts = async () => {
    Alert.alert(
      'Import danh bạ',
      'Bạn có muốn import danh sách liên hệ từ API?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            const result = await importContactsFromAPI();
            if (result.success) {
              Alert.alert(
                'Thành công',
                `Đã import ${result.imported} liên hệ. Bỏ qua ${result.skipped} liên hệ trùng lặp.`
              );
            } else {
              Alert.alert('Lỗi', 'Không thể import danh bạ từ API');
            }
          },
        },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {searchQuery
          ? 'Không tìm thấy liên hệ'
          : showFavoritesOnly
          ? 'Chưa có liên hệ yêu thích'
          : 'Chưa có liên hệ nào'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Thử tìm kiếm với từ khóa khác'
          : 'Nhấn nút + để thêm liên hệ mới'}
      </Text>
    </View>
  );

  const favoriteCount = allContacts.filter(c => c.favorite === 1).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Simple Contacts</Text>
        <Text style={styles.headerSubtitle}>
          {allContacts.length} liên hệ {favoriteCount > 0 && `• ${favoriteCount} yêu thích`}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên hoặc số điện thoại"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            showFavoritesOnly && styles.filterButtonActive,
          ]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Ionicons
            name={showFavoritesOnly ? 'star' : 'star-outline'}
            size={24}
            color={showFavoritesOnly ? '#FFD700' : '#666'}
          />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.importButton}
          onPress={handleImportContacts}
          disabled={loading}
        >
          <Ionicons name="cloud-download-outline" size={20} color="#007AFF" />
          <Text style={styles.importButtonText}>Import từ API</Text>
        </TouchableOpacity>
      </View>

      {/* Contacts List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={item => item.id!.toString()}
          renderItem={({ item }) => (
            <ContactItem
              contact={item}
              onToggleFavorite={toggleFavorite}
              onEdit={handleEditContact}
              onDelete={deleteContact}
            />
          )}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={
            contacts.length === 0 ? styles.emptyListContainer : styles.listContainer
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddContact}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Modal */}
      <ContactModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveContact}
        editContact={editingContact}
      />

      {/* Error Toast */}
      {error && (
        <View style={styles.errorToast}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    marginLeft: 10,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  filterButtonActive: {
    backgroundColor: '#FFF9E6',
  },
  actionBar: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#E8F4FF',
    borderRadius: 10,
  },
  importButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  listContainer: {
    paddingVertical: 10,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#bbb',
    marginTop: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  errorToast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 10,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
});