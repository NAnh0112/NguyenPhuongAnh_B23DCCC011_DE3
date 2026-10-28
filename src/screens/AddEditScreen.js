import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { isValidDate, parseDateDMY, getTodayDate } from '../utils/helpers';

const STORAGE_KEY = '@tasks_list_v3';
const CATEGORIES = ['Học tập', 'Công việc', 'Sức khoẻ', 'Cá nhân'];
const PRIORITIES = ['Cao', 'Trung bình', 'Thấp'];

export default function AddEditScreen({ route, navigation }) {
  const editingTask = route.params?.task;

  const [title, setTitle] = useState(editingTask ? editingTask.title : '');
  const [note, setNote] = useState(editingTask ? editingTask.note || '' : '');
  const [category, setCategory] = useState(editingTask ? editingTask.category : 'Học tập');
  const [priority, setPriority] = useState(editingTask ? editingTask.priority : 'Trung bình');
  const [dueDate, setDueDate] = useState(editingTask ? editingTask.dueDate : '');

  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Tên công việc không được để trống';
    } else if (title.length > 50) {
      newErrors.title = 'Tên công việc tối đa 50 ký tự';
    }

    if (!dueDate.trim()) {
      newErrors.dueDate = 'Hạn hoàn thành không được để trống';
    } else if (!isValidDate(dueDate)) {
      newErrors.dueDate = 'Định dạng ngày không hợp lệ hoặc ngày không tồn tại (dd/mm/yyyy)';
    } else {
      if (!editingTask) {
        const due = parseDateDMY(dueDate);
        const today = getTodayDate();
        if (due && due < today) {
          newErrors.dueDate = 'Hạn hoàn thành khi thêm mới không được trước ngày hôm nay';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let tasks = stored ? JSON.parse(stored) : [];

      if (editingTask) {
        tasks = tasks.map(t => t.id === editingTask.id ? {
          ...t,
          title: title.trim(),
          note: note.trim(),
          category,
          priority,
          dueDate: dueDate.trim(),
        } : t);
      } else {
        const newTask = {
          id: Date.now().toString(),
          title: title.trim(),
          note: note.trim(),
          category,
          priority,
          dueDate: dueDate.trim(),
          done: false,
        };
        tasks.push(newTask);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      navigation.goBack();
    } catch (error) {
      console.error('Không thể lưu công việc:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTitle}>{editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên công việc <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Nhập tên công việc (tối đa 50 ký tự)..."
              placeholderTextColor={COLORS.textSecondary}
              value={title}
              onChangeText={(text) => { setTitle(text); setErrors({ ...errors, title: null }); }}
              maxLength={50}
            />
            <View style={styles.subInfoRow}>
              {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : <View />}
              <Text style={styles.charCount}>{title.length}/50</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Danh mục</Text>
            <View style={styles.optionsRow}>
              {CATEGORIES.map(cat => (
                <Pressable
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mức ưu tiên</Text>
            <View style={styles.optionsRow}>
              {PRIORITIES.map(pri => (
                <Pressable
                  key={pri}
                  style={[
                    styles.chip, 
                    priority === pri && (
                      pri === 'Cao' ? styles.priCao : pri === 'Trung bình' ? styles.priTrungBinh : styles.priThap
                    )
                  ]}
                  onPress={() => setPriority(pri)}
                >
                  <Text style={[styles.chipText, priority === pri && styles.chipTextActive]}>
                    {pri}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hạn hoàn thành (dd/mm/yyyy) <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.dueDate && styles.inputError]}
              placeholder="VD: 25/12/2026"
              placeholderTextColor={COLORS.textSecondary}
              value={dueDate}
              onChangeText={(text) => { setDueDate(text); setErrors({ ...errors, dueDate: null }); }}
              keyboardType="numeric"
              maxLength={10}
            />
            {errors.dueDate && <Text style={styles.errorText}>{errors.dueDate}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ghi chú (không bắt buộc)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Thêm ghi chú chi tiết..."
              placeholderTextColor={COLORS.textSecondary}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
            />
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{editingTask ? 'Cập nhật công việc' : 'Lưu công việc mới'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: COLORS.danger,
    borderWidth: 1.5,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  subInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  priCao: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  priTrungBinh: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  priThap: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFF',
  },
  saveButton: {
    backgroundColor: COLORS.warning,
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});