import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { COLORS } from '../theme/colors';
import { getDueDateStatus } from '../utils/helpers';

export default function TaskItem({ item, onToggleDone, onPress, onLongPress }) {
  const dueDateInfo = getDueDateStatus(item.dueDate);
  const isOverdue = !item.done && dueDateInfo.isOverdue;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Cao': return COLORS.danger;
      case 'Trung bình': return COLORS.warning;
      case 'Thấp': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        item.done && styles.cardDone,
        pressed && { opacity: 0.85 }
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Pressable 
        style={[styles.checkbox, item.done && styles.checkboxDone]} 
        onPress={onToggleDone}
      >
        {item.done && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, item.done && styles.textDone]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>
              {item.priority}
            </Text>
          </View>
        </View>

        <Text style={styles.categoryText}>📁 {item.category}</Text>

        <View style={styles.footerRow}>
          <Text style={styles.dateText}>📅 {item.dueDate}</Text>
          
          {item.done ? (
            <Text style={styles.completedLabel}>Đã xong</Text>
          ) : isOverdue ? (
            <Text style={styles.overdueBadge}>Quá hạn</Text>
          ) : (
            <Text style={styles.timeLeftText}>{dueDateInfo.label}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E8E3',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.08 : 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDone: {
    backgroundColor: '#E8F0EE',
    borderColor: '#D5E4E0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  textDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  completedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  overdueBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.danger,
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeLeftText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.warning,
  },
});