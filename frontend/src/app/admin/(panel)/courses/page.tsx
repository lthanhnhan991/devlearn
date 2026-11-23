'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/auth-context';
import {
  listAdminCourses,
  createCourse,
  getAdminCourse,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
  listAdminTopics,
} from '@/services';
import type {
  AdminCourseRowDto,
  AdminTopicDto,
  CourseLevel,
  CreateCourseReq,
  UpdateCourseReq,
} from '@/types';
import { LABELS } from '@/types';
import { Button, buttonStyles } from '@/components/ui/Button';
import { InfoBanner } from '@/components/admin/InfoBanner';
import { cn } from '@/lib/cn';

const LEVEL_OPTIONS: Array<{ value: CourseLevel; label: string }> = [
  { value: 'BEGINNER', label: LABELS.level.BEGINNER },
  { value: 'INTERMEDIATE', label: LABELS.level.INTERMEDIATE },
  { value: 'ADVANCED', label: LABELS.level.ADVANCED },
];

export default function AdminCoursesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Course list state
  const [courses, setCourses] = useState<AdminCourseRowDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'DRAFT' | 'PUBLISHED'>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [bannerError, setBannerError] = useState<string | null>(null);

  // Topics for select dropdown
  const [topics, setTopics] = useState<AdminTopicDto[]>([]);

  // Create / Edit Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTopicId, setFormTopicId] = useState('');
  const [formLevel, setFormLevel] = useState<CourseLevel>('BEGINNER');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete modal state
  const [deletingCourse, setDeletingCourse] = useState<AdminCourseRowDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Status toggle pending state
  const [togglingCourseId, setTogglingCourseId] = useState<string | null>(null);

  // Load topics
  async function loadTopics() {
    try {
      const data = await listAdminTopics();
      setTopics(data);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadTopics();
  }, []);

  // Fetch courses
  async function fetchCourses() {
    try {
      setLoading(true);
      setBannerError(null);
      const res = await listAdminCourses({
        q: searchQuery.trim() || undefined,
        status: statusFilter || undefined,
        page,
        pageSize: 10,
        sort: 'newest',
      });
      setCourses(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalItems(res.meta.total);
    } catch (err: unknown) {
      setBannerError(err instanceof Error ? err.message : 'Không thể nạp danh sách khóa học.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, [searchQuery, statusFilter, page]);

  // Open Create Modal
  function handleOpenCreate() {
    setEditingCourseId(null);
    setFormTitle('');
    setFormDescription('');
    // Default to first active topic if available
    const firstActive = topics.find((t) => t.isActive);
    setFormTopicId(firstActive ? firstActive.id : '');
    setFormLevel('BEGINNER');
    setFormError(null);
    setIsFormOpen(true);
  }

  // Open Edit Modal
  async function handleOpenEdit(course: AdminCourseRowDto) {
    try {
      setFormError(null);
      setEditingCourseId(course.id);
      setIsFormOpen(true);
      setFormSubmitting(true);
      const detail = await getAdminCourse(course.id);
      setFormTitle(detail.title);
      setFormDescription(detail.description);
      setFormTopicId(detail.topic.id);
      setFormLevel(detail.level);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Không thể tải chi tiết khóa học.');
    } finally {
      setFormSubmitting(false);
    }
  }

  // Submit Modal Form
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const titleTrimmed = formTitle.trim();
    if (!titleTrimmed || titleTrimmed.length < 3) {
      setFormError('Tên khóa học phải từ 3 đến 200 ký tự.');
      return;
    }
    if (!formTopicId) {
      setFormError('Vui lòng chọn chủ đề cho khóa học.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingCourseId) {
        const updateData: UpdateCourseReq = {
          title: titleTrimmed,
          description: formDescription,
          topicId: formTopicId,
          level: formLevel,
        };
        await updateCourse(editingCourseId, updateData);
      } else {
        const createData: CreateCourseReq = {
          title: titleTrimmed,
          description: formDescription,
          topicId: formTopicId,
          level: formLevel,
        };
        await createCourse(createData);
      }
      setIsFormOpen(false);
      await fetchCourses();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu khóa học.');
    } finally {
      setFormSubmitting(false);
    }
  }

  // Toggle Publish Status
  async function handleToggleStatus(course: AdminCourseRowDto) {
    const nextStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setTogglingCourseId(course.id);
    setBannerError(null);
    try {
      await updateCourseStatus(course.id, nextStatus);
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, status: nextStatus } : c)),
      );
    } catch (err: unknown) {
      setBannerError(
        err instanceof Error
          ? err.message
          : 'Không thể thay đổi trạng thái khóa học. Cần có ít nhất 1 bài học đã xuất bản.',
      );
    } finally {
      setTogglingCourseId(null);
    }
  }

  // Confirm Delete
  async function handleConfirmDelete() {
    if (!deletingCourse) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCourse(deletingCourse.id);
      setDeletingCourse(null);
      await fetchCourses();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Không thể xóa khóa học.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* InfoBanner */}
      <InfoBanner targetScreen="Danh mục khóa học" />

      {/* Global Error Banner */}
      {bannerError && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          <span>{bannerError}</span>
          <button
            type="button"
            onClick={() => setBannerError(null)}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-admin-navy">
            Quản lý khóa học
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tạo, cấu hình lộ trình và quản lý trạng thái xuất bản khóa học trong hệ thống DevLearn
          </p>
        </div>

        <Button
          type="button"
          variant="admin-primary"
          size="md"
          onClick={handleOpenCreate}
        >
          + Thêm khóa học
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Tìm theo tên khóa học…"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="h-10 w-full max-w-sm rounded-lg border border-slate-300 px-3.5 text-sm placeholder:text-slate-400 focus-visible:border-admin-primary focus-visible:outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as '' | 'DRAFT' | 'PUBLISHED');
            setPage(1);
          }}
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 focus-visible:border-admin-primary focus-visible:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PUBLISHED">Đã xuất bản</option>
          <option value="DRAFT">Bản nháp</option>
        </select>

        <span className="ml-auto text-xs font-medium text-slate-500">
          Tổng cộng: <strong>{totalItems}</strong> khóa học
        </span>
      </div>

      {/* Course Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Tên khóa học</th>
                <th className="px-4 py-3">Chủ đề</th>
                <th className="px-4 py-3">Giảng viên</th>
                <th className="px-4 py-3 text-center">Module</th>
                <th className="px-4 py-3 text-center">Học viên</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    Đang nạp danh sách khóa học…
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Không tìm thấy khóa học nào phù hợp.
                  </td>
                </tr>
              ) : (
                courses.map((course) => {
                  const levelBadge =
                    course.level === 'BEGINNER'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : course.level === 'INTERMEDIATE'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200';

                  const isToggling = togglingCourseId === course.id;

                  return (
                    <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                      {/* Title & Level */}
                      <td className="px-4 py-3 font-medium text-slate-900 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span className="line-clamp-2">{course.title}</span>
                          <span
                            className={cn(
                              'inline-block w-fit rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                              levelBadge,
                            )}
                          >
                            {LABELS.level[course.level]}
                          </span>
                        </div>
                      </td>

                      {/* Topic */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="size-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: course.topic.color ?? '#1D5E8C' }}
                          />
                          <span
                            className={cn(
                              'text-xs font-medium',
                              !course.topicIsActive && 'text-slate-400 italic',
                            )}
                          >
                            {course.topic.name}
                            {!course.topicIsActive && ' (đã ẩn)'}
                          </span>
                        </div>
                      </td>

                      {/* Teacher */}
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {course.teacher.fullName}
                      </td>

                      {/* Module Count */}
                      <td className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                        {course.moduleCount}
                      </td>

                      {/* Enrollment Count */}
                      <td className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                        {course.enrollmentCount}
                      </td>

                      {/* Status & Toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleToggleStatus(course)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors border',
                            course.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200',
                            isToggling && 'opacity-60 cursor-wait',
                          )}
                          title="Bấm để chuyển đổi trạng thái Xuất bản / Bản nháp"
                        >
                          <span
                            className={cn(
                              'size-1.5 rounded-full',
                              course.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-slate-400',
                            )}
                          />
                          {course.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/lessons?courseId=${course.id}`}
                            className={buttonStyles({
                              variant: 'admin-outline',
                              size: 'md',
                            })}
                          >
                            Soạn bài
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(course)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-admin-primary transition-colors"
                            title="Sửa thông tin khóa học"
                          >
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="size-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                              />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeletingCourse(course);
                              setDeleteError(null);
                            }}
                            className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Xóa khóa học"
                          >
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="size-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Trang {page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Trước
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Course Create / Edit Modal */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-admin-navy">
              {editingCourseId ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Điền các thông tin cơ bản của khóa học. Bạn có thể soạn module và bài học sau khi tạo.
            </p>

            {formError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Tên khóa học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lập trình TypeScript cơ bản"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus-visible:border-admin-primary focus-visible:outline-none"
                />
              </div>

              {/* Topic Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Chủ đề đào tạo <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formTopicId}
                  onChange={(e) => setFormTopicId(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 focus-visible:border-admin-primary focus-visible:outline-none"
                >
                  <option value="" disabled>
                    -- Chọn chủ đề --
                  </option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id} disabled={!t.isActive && t.id !== formTopicId}>
                      {t.name} {!t.isActive ? '(đã ẩn)' : ''}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  Chỉ các chủ đề đang hoạt động mới được gán cho khóa học mới.
                </p>
              </div>

              {/* Level Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Cấp độ khóa học
                </label>
                <select
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value as CourseLevel)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 focus-visible:border-admin-primary focus-visible:outline-none"
                >
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Mô tả khóa học
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả tóm tắt nội dung và mục tiêu đầu ra của khóa học…"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 p-3 text-sm focus-visible:border-admin-primary focus-visible:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="admin-outline"
                  size="md"
                  disabled={formSubmitting}
                  onClick={() => setIsFormOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="admin-primary"
                  size="md"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Đang lưu…' : editingCourseId ? 'Cập nhật' : 'Tạo khóa học'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deletingCourse && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Xác nhận xóa khóa học</h2>
            <p className="mt-2 text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa khóa học{' '}
              <strong className="text-slate-900">{deletingCourse.title}</strong>?
            </p>

            {deletingCourse.enrollmentCount > 0 && (
              <div
                role="alert"
                className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"
              >
                ⚠️ Khóa học này hiện đã có <strong>{deletingCourse.enrollmentCount}</strong> học viên
                đăng ký. Theo quy tắc nghiệp vụ, bạn không thể xóa khóa học đã có học viên. Hãy chuyển
                sang trạng thái <strong>Bản nháp</strong> thay vì xóa.
              </div>
            )}

            {deleteError && (
              <div
                role="alert"
                className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
              >
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="admin-outline"
                size="md"
                disabled={isDeleting}
                onClick={() => setDeletingCourse(null)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="admin-danger"
                size="md"
                disabled={isDeleting || deletingCourse.enrollmentCount > 0}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? 'Đang xóa…' : 'Xóa khóa học'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
