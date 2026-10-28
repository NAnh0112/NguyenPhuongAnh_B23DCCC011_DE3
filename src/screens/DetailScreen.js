import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { getDueDateStatus } from '../utils/helpers';

const STORAGE_KEY = '@tasks_list_v3';

export default function DetailScreen({ route, navigation }) {
  const [task, setTask] = useState(route.params?.task);
  const taskId = route.params?.task?.id;

  useFocusEffect(
    useCallback(() => {
      let isScreenActive = true;

      const loadTask = async () => {
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          const tasks = stored ? JSON.parse(stored) : [];
          const latestTask = tasks.find(item => item.id === taskId);

          if (isScreenActive && latestTask) {
            setTask(latestTask);
          }
        } catch (error) {
          console.error('Không thể tải công việc:', error);
        }
      };

      loadTask();

      return () => {
        isScreenActive = false;
      };
    }, [taskId])
  );

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Không tìm thấy công việc.</Text>
      </SafeAreaView>
    );
  }

  const dueDateInfo = getDueDateStatus(task.dueDate);
  const isOverdue = !task.done && dueDateInfo.isOverdue;

  const handleToggleStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const tasks = JSON.parse(stored);
        const updatedTask = { ...task, done: !task.done };
        const updatedTasks = tasks.map(item => (
          item.id === task.id ? updatedTask : item
        ));

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
        setTask(updatedTask);
      }
    } catch (error) {
      console.error('Không thể cập nhật trạng thái công việc:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Cao': return COLORS.danger;
      case 'Trung bình': return COLORS.warning;
      case 'Thấp': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
              <Text style={styles.priorityText}>
                Ưu tiên: {task.priority}
              </Text>
            </View>

            {task.done ? (
              <View style={[styles.statusBadge, styles.statusCompleted]}>
                <Text style={[styles.statusText, styles.statusCompletedText]}>Đã hoàn thành</Text>
              </View>
            ) : isOverdue ? (
              <View style={[styles.statusBadge, styles.statusOverdue]}>
                <Text style={[styles.statusText, styles.statusOverdueText]}>Quá hạn</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, styles.statusActive]}>
                <Text style={[styles.statusText, styles.statusActiveText]}>Đang thực hiện</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{task.title}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>📁 Danh mục:</Text>
            <Text style={styles.value}>{task.category}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>📅 Hạn hoàn thành:</Text>
            <Text style={styles.value}>{task.dueDate}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>⏱️ Thời gian:</Text>
            <Text style={[styles.value, isOverdue && styles.overdueText]}>
              {task.done ? 'Đã hoàn thành' : dueDateInfo.label}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.noteTitle}>Ghi chú chi tiết:</Text>
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>{task.note ? task.note : 'Không có ghi chú cho công việc này.'}</Text>
          </View>
        </View>

        <Pressable 
          style={[styles.actionButton, task.done ? styles.btnIncomplete : styles.btnComplete]} 
          onPress={handleToggleStatus}
        >
          <Text style={styles.actionButtonText}>
            {task.done ? '↩️ Đánh dấu là Chưa hoàn thành' : '✓ Đánh dấu là Đã hoàn thành'}
          </Text>
        </Pressable>

        <Pressable 
          style={styles.editButton} 
          onPress={() => {
            navigation.navigate('AddEdit', { task });
          }}
        >
          <Text style={styles.editButtonText}>✏️ Chỉnh sửa công việc</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 18,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E8E3',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 4,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priorityText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusCompleted: {
    backgroundColor: '#C6F6D5',
  },
  statusCompletedText: {
    color: COLORS.success,
  },
  statusOverdue: {
    backgroundColor: '#FED7D7',
  },
  statusOverdueText: {
    color: COLORS.danger,
  },
  statusActive: {
    backgroundColor: '#FEFCBF',
  },
  statusActiveText: {
    color: '#B7791F',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  overdueText: {
    color: COLORS.danger,
    fontWeight: 'bold',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  noteBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actionButton: {
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  btnComplete: {
    backgroundColor: COLORS.success,
  },
  btnIncomplete: {
    backgroundColor: COLORS.warning,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyText: {
    padding: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});