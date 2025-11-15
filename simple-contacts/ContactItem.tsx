import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Contact } from './useContacts';

interface ContactItemProps {
  contact: Contact;
  onToggleFavorite: (id: number, currentFavorite: number) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: number) => void;
}

export const ContactItem: React.FC<ContactItemProps> = ({
  contact,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa liên hệ "${contact.name}"?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => onDelete(contact.id!),
        },
      ]
    );
  };

  const isFavorite = contact.favorite === 1;

  return (
    <View style={[styles.container, isFavorite && styles.favoriteContainer]}>
      <View style={styles.leftSection}>
        <TouchableOpacity
          onPress={() => onToggleFavorite(contact.id!, contact.favorite)}
          style={styles.favoriteButton}
        >
          <Ionicons
            name={isFavorite ? 'star' : 'star-outline'}
            size={28}
            color={isFavorite ? '#FFD700' : '#999'}
          />
        </TouchableOpacity>

        <View style={styles.contactInfo}>
          <Text style={styles.name}>{contact.name}</Text>
          {contact.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{contact.phone}</Text>
            </View>
          )}
          {contact.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{contact.email}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={() => onEdit(contact)}
          style={styles.actionButton}
        >
          <Ionicons name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={24} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  favoriteContainer: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 5,
    marginRight: 10,
  },
  contactInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});