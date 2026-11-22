'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import {
  listAdminTopics,
  createTopic,
  updateTopic,
  reorderTopics,
  deleteTopic,
} from '@/services';
import type { AdminTopicDto, CreateTopicReq, UpdateTopicReq } from '@/types';
import { TOPIC_ICON_KEYS, type TopicIconKey } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const COLOR_PRESETS = [
  '#1D5E8C',
  '#37474F',
  '#00796B',
  '#2E7D32',
  '#6A1B9A',
  '#E65100',
  '#C2185B',
  '#D32F2F',
];

const ICON_MAP: Record<string, string> = {
  code: '{ }',
  database: '⛁',
  globe: '🌐',
  bug: '🐛',
  cpu: '⚡',
  server: '🖥',
  shield: '🛡',
  book: '📖',
};

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminTopicsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [topics, setTopics] = useState<AdminTopicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<AdminTopicDto | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#1D5E8C');
  const [formIcon, setFormIcon] = useState<TopicIconKey | null>('code');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deletingTopic, setDeletingTopic] = useState<AdminTopicDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load topics
  async function fetchTopics(query?: string) {
    try {
      setLoading(true);
      const data = await listAdminTopics(query ? { q: query } : undefined);
      setTopics(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTopics(searchQuery);
  }, [searchQuery]);

  // Open modal for Create
  function handleOpenCreate() {
    setEditingTopic(null);
    setFormName('');
    setFormSlug('');
    setIsSlugManual(false);
    setFormDescription('');
    setFormColor('#1D5E8C');
    setFormIcon('code');
    setFormIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  }

  // Open modal for Edit
  function handleOpenEdit(topic: AdminTopicDto) {
    setEditingTopic(topic);
    setFormName(topic.name);
    setFormSlug(topic.slug);
    setIsSlugManual(true);
    setFormDescription(topic.description);
    setFormColor(topic.color ?? '#1D5E8C');
    setFormIcon((topic.icon as TopicIconKey) ?? null);
    setFormIsActive(topic.isActive);
    setFormError(null);
    setIsModalOpen(true);
  }

  // Handle auto-slug on name change
  function handleNameChange(val: string) {
    setFormName(val);
    if (!editingTopic && !isSlugManual) {
      setFormSlug(slugify(val));
    }
  }

  // Submit Add / Edit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Tên chủ đề không được để trống.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingTopic) {
        const updateData: UpdateTopicReq = {
          name: formName.trim(),
          description: formDescription,
          color: formColor,
          icon: formIcon,
          isActive: formIsActive,
        };
        await updateTopic(editingTopic.id, updateData);
      } else {
        const createData: CreateTopicReq = {
          name: formName.trim(),
          slug: formSlug.trim() || undefined,
          description: formDescription,
          color: formColor,
          icon: formIcon,
          isActive: formIsActive,
        };
        await createTopic(createData);
      }
      setIsModalOpen(false);
      await fetchTopics(searchQuery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu chủ đề.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // Toggle active status directly from row
  async function handleToggleActive(topic: AdminTopicDto) {
    try {
      await updateTopic(topic.id, { isActive: !topic.isActive });
      setTopics((prev) =>
        prev.map((t) => (t.id === topic.id ? { ...t, isActive: !t.isActive } : t)),
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái.');
    }
  }

  // Reorder up / down
  async function handleMove(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= topics.length) return;

    const nextTopics = [...topics];
    const current = nextTopics[index]!;
    const target = nextTopics[targetIndex]!;
    nextTopics[index] = target;
    nextTopics[targetIndex] = current;

    setTopics(nextTopics);

    try {
      const orderedIds = nextTopics.map((t) => t.id);
      await reorderTopics(orderedIds);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể lưu thứ tự sắp xếp.');
      await fetchTopics(searchQuery);
    }
  }

  // Delete handler
  async function handleConfirmDelete() {
    if (!deletingTopic) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteTopic(deletingTopic.id);
      setDeletingTopic(null);
      await fetchTopics(searchQuery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa chủ đề.';
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-admin-navy">
            Quản lý chủ đề khóa học
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản trị các danh mục đào tạo động cho toàn hệ thống DevLearn
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="admin-primary"
            size="md"
            onClick={handleOpenCreate}
          >
            + Thêm chủ đề
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <input
          type="search"
          placeholder="Tìm theo tên chủ đề hoặc slug…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full max-w-sm rounded-lg border border-slate-300 px-3.5 text-sm placeholder:text-slate-400 focus-visible:border-admin-primary focus-visible:outline-none"
        />
        <span className="ml-auto text-xs font-medium text-slate-500">
          Tổng cộng: <strong>{topics.length}</strong> chủ đề
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase font-bold text-slate-600">
              <tr>
                <th className="px-4 py-3 text-center w-24">Thứ tự</th>
                <th className="px-4 py-3">Chủ đề</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-center">Khóa học</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                    Đang nạp danh sách chủ đề…
                  </td>
                </tr>
              ) : topics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Không tìm thấy chủ đề nào phù hợp.
                  </td>
                </tr>
              ) : (
                topics.map((t, idx) => {
                  const iconSymbol = (t.icon && ICON_MAP[t.icon]) || '📚';
                  const customColor = t.color ?? '#1D5E8C';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      {/* Reorder Buttons */}
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMove(idx, 'up')}
                            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Chuyển lên"
                          >
                            ▲
                          </button>
                          <span className="font-mono text-xs text-slate-500 w-4 text-center">
                            {idx + 1}
                          </span>
                          <button
                            type="button"
                            disabled={idx === topics.length - 1}
                            onClick={() => handleMove(idx, 'down')}
                            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Chuyển xuống"
                          >
                            ▼
                          </button>
                        </div>
                      </td>

                      {/* Topic Name & Icon */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                            style={{
                              backgroundColor: `${customColor}20`,
                              color: customColor,
                            }}
                          >
                            {iconSymbol}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{t.name}</p>
                            {t.description && (
                              <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                                {t.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {t.slug}
                      </td>

                      {/* Course count */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          {t.courseCount} khóa
                        </span>
                      </td>

                      {/* Active Status Toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(t)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-colors',
                            t.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                          )}
                        >
                          <span
                            className={cn(
                              'size-1.5 rounded-full',
                              t.isActive ? 'bg-emerald-600' : 'bg-slate-400',
                            )}
                          />
                          {t.isActive ? 'Hoạt động' : 'Đang ẩn'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(t)}
                            className="text-xs font-semibold text-admin-primary hover:underline"
                          >
                            Sửa
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDeletingTopic(t);
                            }}
                            disabled={!isAdmin}
                            title={!isAdmin ? 'Chỉ Quản trị viên mới được xóa chủ đề' : undefined}
                            className={cn(
                              'text-xs font-semibold',
                              isAdmin
                                ? 'text-rose-600 hover:underline'
                                : 'text-slate-300 cursor-not-allowed',
                            )}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Drawer Thêm & Sửa Chủ đề (ADMIN · 10) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-admin-navy">
                {editingTopic ? 'Chỉnh sửa chủ đề' : 'Thêm chủ đề mới'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">
                  {formError}
                </div>
              )}

              {/* Tên chủ đề */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Tên chủ đề <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lập trình di động"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus-visible:border-admin-primary focus-visible:outline-none"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Slug (đường dẫn lọc)
                </label>
                <input
                  type="text"
                  disabled={!!editingTopic}
                  placeholder="lap-trinh-di-dong"
                  value={formSlug}
                  onChange={(e) => {
                    setIsSlugManual(true);
                    setFormSlug(e.target.value);
                  }}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 font-mono text-sm focus-visible:border-admin-primary focus-visible:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                />
                {editingTopic && (
                  <p className="text-[11px] text-slate-400 italic">
                    Slug là định danh bất biến, không thể thay đổi sau khi tạo.
                  </p>
                )}
              </div>

              {/* Mô tả */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả nội dung chủ đề hiển thị ở trang chủ…"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus-visible:border-admin-primary focus-visible:outline-none"
                />
              </div>

              {/* Màu đại diện */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Màu đại diện</label>
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormColor(color)}
                      className={cn(
                        'size-7 rounded-full border-2 transition-transform',
                        formColor.toUpperCase() === color.toUpperCase()
                          ? 'border-slate-800 scale-110 shadow-sm'
                          : 'border-transparent hover:scale-105',
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    placeholder="#1D5E8C"
                    className="h-7 w-24 rounded border border-slate-300 px-2 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              {/* Icon */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Biểu tượng (Icon)</label>
                <div className="grid grid-cols-4 gap-2">
                  {TOPIC_ICON_KEYS.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setFormIcon(k)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors',
                        formIcon === k
                          ? 'border-admin-primary bg-blue-50 text-admin-primary font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600',
                      )}
                    >
                      <span className="text-base">{ICON_MAP[k]}</span>
                      <span>{k}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trạng thái hoạt động */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-admin-primary focus:ring-admin-primary"
                />
                <label htmlFor="formIsActive" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Kích hoạt chủ đề (hiển thị công khai ở Client)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <Button
                  type="submit"
                  variant="admin-primary"
                  size="md"
                  loading={submitting}
                >
                  {editingTopic ? 'Lưu thay đổi' : 'Tạo chủ đề'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa an toàn (ADMIN · 11) */}
      {deletingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-admin-navy">
              {deletingTopic.courseCount > 0 ? 'Không thể xóa chủ đề' : 'Xác nhận xóa chủ đề'}
            </h2>

            {deleteError && (
              <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {deleteError}
              </div>
            )}

            {deletingTopic.courseCount > 0 ? (
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <p>
                  Chủ đề <strong className="text-slate-800">{deletingTopic.name}</strong> đang có{' '}
                  <strong className="text-rose-600">{deletingTopic.courseCount}</strong> khóa học
                  thuộc danh mục này.
                </p>
                <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  💡 <strong>Gợi ý:</strong> Bạn không thể xóa một chủ đề đang được sử dụng. Hãy chuyển
                  trạng thái sang <strong>&quot;Đang ẩn&quot;</strong> để ẩn khỏi giao diện tìm kiếm của người
                  học mà không ảnh hưởng tới các khóa học hiện tại.
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setDeletingTopic(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleToggleActive(deletingTopic);
                      setDeletingTopic(null);
                    }}
                    className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                  >
                    Ẩn chủ đề này
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <p>
                  Bạn có chắc chắn muốn xóa vĩnh viễn chủ đề{' '}
                  <strong className="text-slate-800">{deletingTopic.name}</strong>?
                </p>
                <p className="text-xs text-slate-400">
                  Thao tác này không thể hoàn tác sau khi thực hiện.
                </p>
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setDeletingTopic(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <Button
                    type="button"
                    variant="admin-danger"
                    size="md"
                    loading={deleting}
                    onClick={handleConfirmDelete}
                  >
                    Xóa vĩnh viễn
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
