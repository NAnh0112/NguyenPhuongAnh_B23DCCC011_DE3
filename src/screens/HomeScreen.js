import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Alert,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TaskItem from '../components/TaskItem';
import { COLORS } from '../theme/colors';
import { getDueDateStatus, parseDateDMY } from '../utils/helpers';

const STORAGE_KEY = '@tasks_list_v3';
const PRIORITY_ORDER = { Cao: 1, 'Trung bình': 2, Thấp: 3 };
const FILTER_TABS = [
  { key: 'All', label: 'Tất cả' },
  { key: 'Active', label: 'Chưa xong' },
  { key: 'Completed', label: 'Đã xong' },
  { key: 'Overdue', label: 'Quá hạn' },
];

const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Nộp bài tập lớn React Native',
    note: 'Đã hoàn thành phần giao diện',
    category: 'Học tập',
    priority: 'Cao',
    dueDate: '15/09/2026',
    done: true,
  },
  {
    id: '2',
    title: 'Báo cáo tiến độ đồ án tốt nghiệp',
    note: 'Chuẩn bị slide thuyết trình',
    category: 'Công việc',
    priority: 'Cao',
    dueDate: '10/04/2026',
    done: false,
  },
  {
    id: '3',
    title: 'Đi khám sức khỏe định kỳ',
    note: 'Phòng khám đa khoa quốc tế',
    category: 'Sức khoẻ',
    priority: 'Trung bình',
    dueDate: '30/11/2026',
    done: false,
  },
  {
    id: '4',
    title: 'Mua quà sinh nhật cho bạn thân',
    note: 'Chọn cửa hàng lưu niệm',
    category: 'Cá nhân',
    priority: 'Thấp',
    dueDate: '05/12/2026',
    done: false,
  },
  {
    id: '5',
    title: 'Ôn tập kiến trúc mạng Cisco',
    note: 'Làm bài lab OSPF',
    category: 'Học tập',
    priority: 'Cao',
    dueDate: '25/11/2026',
    done: false,
  },
  {
    id: '6',
    title: 'Đọc sách kỹ năng mềm',
    note: 'Đọc tối thiểu 2 chương',
    category: 'Cá nhân',
    priority: 'Thấp',
    dueDate: '01/12/2026',
    done: false,
  },
];

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [sortBy, setSortBy] = useState('date');

  const normalizeTasks = (taskList) => taskList.map(task => ({
    ...task,
    done: task.done === true,
  }));

  useFocusEffect(
    useCallback(() => {
      const loadTasks = async () => {
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);

          if (stored) {
            setTasks(normalizeTasks(JSON.parse(stored)));
          } else {
            setTasks(INITIAL_TASKS);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
          }
        } catch (error) {
          console.error('Không thể tải danh sách công việc:', error);
        }
      };

      loadTasks();
    }, [])
  );

  const saveTasks = async (newTasks) => {
    try {
      setTasks(newTasks);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (error) {
      console.error('Không thể lưu danh sách công việc:', error);
    }
  };

  const handleToggleDone = (id) => {
    const updated = tasks.map(task => (
      task.id === id ? { ...task, done: !task.done } : task
    ));
    saveTasks(updated);
  };

  const handleDeleteTask = (id, title) => {
    Alert.alert(
      'Xác nhận xoá',
      `Bạn có chắc chắn muốn xoá công việc "${title}" không?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: () => {
            const updated = tasks.filter(t => t.id !== id);
            saveTasks(updated);
          }
        }
      ]
    );
  };

  const handleDeleteCompleted = () => {
    const completedCount = tasks.filter(task => task.done === true).length;
    if (completedCount === 0) return;

    Alert.alert(
      'Xoá việc đã hoàn thành',
      `Bạn có chắc chắn muốn xoá ${completedCount} công việc đã hoàn thành không?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá tất cả',
          style: 'destructive',
          onPress: () => {
            const updated = tasks.filter(task => task.done !== true);
            saveTasks(updated);
          }
        }
      ]
    );
  };

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(task => task.done === true).length;
  const progressPercent = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  const filteredTasks = tasks.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const dueDateInfo = getDueDateStatus(item.dueDate);
    const isOverdue = item.done !== true && dueDateInfo.isOverdue;

    if (filterTab === 'Active') return matchesSearch && item.done !== true;
    if (filterTab === 'Completed') return matchesSearch && item.done === true;
    if (filterTab === 'Overdue') return matchesSearch && isOverdue;
    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = parseDateDMY(a.dueDate) || new Date(0);
      const dateB = parseDateDMY(b.dueDate) || new Date(0);
      return dateA - dateB; // Gần nhất lên đầu
    } else {
      return (PRIORITY_ORDER[a.priority] || 4) - (PRIORITY_ORDER[b.priority] || 4);
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>KẾ HOẠCH CÁ NHÂN</Text>
          <Text style={styles.headerTitle}>Việc cần làm</Text>
        </View>
        <Pressable 
          style={styles.addButton} 
          onPress={() => navigation.navigate('AddEdit', { task: null })}
        >
          <Text style={styles.addButtonText}>+ Thêm</Text>
        </Pressable>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressCountBlock}>
          <Text style={styles.progressCount}>{completedTasksCount}</Text>
          <Text style={styles.progressCountLabel}>đã xong</Text>
        </View>
        <View style={styles.progressDetails}>
          <Text style={styles.progressLabel}>Tiến độ hôm nay</Text>
          <Text style={styles.progressStats}>
            {completedTasksCount} trên {totalTasksCount} công việc
          </Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm công việc..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.filterRow}>
        {FILTER_TABS.map(tab => (
          <Pressable
            key={tab.key}
            style={[styles.filterChip, filterTab === tab.key && styles.filterChipActive]}
            onPress={() => setFilterTab(tab.key)}
          >
            <Text style={[styles.filterChipText, filterTab === tab.key && styles.filterChipTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actionRow}>
        <Pressable 
          style={styles.sortButton} 
          onPress={() => setSortBy(sortBy === 'date' ? 'priority' : 'date')}
        >
          <Text style={styles.sortButtonText}>
            Sắp xếp theo {sortBy === 'date' ? 'hạn' : 'ưu tiên'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.deleteDoneBtn, completedTasksCount === 0 && styles.disabledBtn]}
          onPress={handleDeleteCompleted}
          disabled={completedTasksCount === 0}
        >
          <Text style={[styles.deleteDoneText, completedTasksCount === 0 && styles.disabledText]}>
            Xoá việc đã xong ({completedTasksCount})
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            item={item}
            onToggleDone={() => handleToggleDone(item.id)}
            onPress={() => navigation.navigate('Detail', { task: item })}
            onLongPress={() => handleDeleteTask(item.id, item.title)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              {filterTab === 'Completed'
                ? 'Chưa có công việc đã hoàn thành'
                : 'Không tìm thấy công việc nào'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    marginBottom: 18,
    backgroundColor: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#BFD0D5',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFCF7',
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#BFD0D5',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#FFFCF7',
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressCountBlock: {
    width: 82,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  progressCount: {
    fontSize: 38,
    lineHeight: 40,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  progressCountLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressDetails: {
    flex: 1,
    paddingLeft: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  progressStats: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 0,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    height: 42,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  clearSearch: {
    fontSize: 16,
    color: COLORS.textSecondary,
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderBottomColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sortButton: {
    paddingVertical: 8,
  },
  sortButtonText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  deleteDoneBtn: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  deleteDoneText: {
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: '600',
  },
  disabledBtn: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
  },
  disabledText: {
    color: COLORS.disabled,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});