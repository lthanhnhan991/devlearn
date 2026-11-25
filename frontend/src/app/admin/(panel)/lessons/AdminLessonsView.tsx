'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  listAdminCourses,
  getCourseStructure,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  createLesson,
  getAdminLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  uploadLessonFile,
} from '@/services';
import type {
  AdminCourseRowDto,
  AdminCourseStructureDto,
  AdminModuleDto,
  AdminLessonDto,
  ContentType,
} from '@/types';
import { Button, buttonStyles } from '@/components/ui/Button';
import { InfoBanner } from '@/components/admin/InfoBanner';
import { cn } from '@/lib/cn';

export function AdminLessonsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseIdParam = searchParams.get('courseId');

  // Courses list for dropdown
  const [courses, setCourses] = useState<AdminCourseRowDto[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseIdParam || '');
  const [structure, setStructure] = useState<AdminCourseStructureDto | null>(null);
  const [loadingStructure, setLoadingStructure] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Selected lesson for editing
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<AdminLessonDto | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);

  // Lesson form state
  const [formTitle, setFormTitle] = useState('');
  const [formContentType, setFormContentType] = useState<ContentType>('VIDEO');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formIsPublished, setFormIsPublished] = useState(false);
  const [videoMode, setVideoMode] = useState<'upload' | 'youtube'>('youtube');
  const [formSaving, setFormSaving] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Module Modals
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<AdminModuleDto | null>(null);
  const [moduleTitleInput, setModuleTitleInput] = useState('');
  const [moduleSubmitting, setModuleSubmitting] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);

  // Lesson Create Modal
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<ContentType>('VIDEO');
  const [lessonSubmitting, setLessonSubmitting] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);

  // Delete Confirm Modal
  const [deletingItem, setDeletingItem] = useState<{
    type: 'module' | 'lesson';
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 1. Load course list
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await listAdminCourses({ pageSize: 100 });
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? (res as unknown as AdminCourseRowDto[])
          : [];
        setCourses(items);
        if (!selectedCourseId && items.length > 0) {
          const firstId = items[0]!.id;
          setSelectedCourseId(firstId);
          router.replace(`/admin/lessons?courseId=${firstId}`);
        }
      } catch {
        setCourses([]);
        setGlobalError('Không thể nạp danh sách khóa học.');
      }
    }
    loadCourses();
  }, []);

  // 2. Load structure when selectedCourseId changes
  useEffect(() => {
    if (!selectedCourseId) return;
    async function loadStructure() {
      try {
        setLoadingStructure(true);
        setGlobalError(null);
        const data = await getCourseStructure(selectedCourseId);
        setStructure(data);

        // Auto select first lesson if available and none selected
        if (!selectedLessonId && data.modules.length > 0 && data.modules[0]!.lessons.length > 0) {
          const firstLesson = data.modules[0]!.lessons[0]!;
          handleSelectLesson(firstLesson.id);
        }
      } catch (err: unknown) {
        setGlobalError(err instanceof Error ? err.message : 'Không thể nạp cấu trúc khóa học.');
      } finally {
        setLoadingStructure(false);
      }
    }
    loadStructure();
  }, [selectedCourseId]);

  // Handle course switch
  function handleCourseChange(newId: string) {
    setSelectedCourseId(newId);
    setSelectedLessonId(null);
    setSelectedLesson(null);
    router.replace(`/admin/lessons?courseId=${newId}`);
  }

  // 3. Select lesson
  async function handleSelectLesson(lessonId: string) {
    setSelectedLessonId(lessonId);
    setFormSuccess(false);
    setFormError(null);
    setUploadError(null);
    try {
      setLoadingLesson(true);
      const lesson = await getAdminLesson(lessonId);
      setSelectedLesson(lesson);
      setFormTitle(lesson.title);
      setFormContentType(lesson.contentType);
      setFormFileUrl(lesson.fileUrl || '');
      setFormIsPublished(lesson.isPublished);

      if (lesson.contentType === 'VIDEO') {
        const isYt = lesson.fileUrl && (lesson.fileUrl.includes('youtube.com') || lesson.fileUrl.includes('youtu.be'));
        setVideoMode(isYt ? 'youtube' : 'upload');
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Không thể nạp thông tin bài học.');
    } finally {
      setLoadingLesson(false);
    }
  }

  // 4. Save Lesson
  async function handleSaveLesson(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!selectedLessonId) return;

    if (!formTitle.trim()) {
      setFormError('Tên bài học không được để trống.');
      return;
    }

    setFormSaving(true);
    setFormError(null);
    setFormSuccess(false);
    try {
      const updated = await updateLesson(selectedLessonId, {
        title: formTitle.trim(),
        contentType: formContentType,
        fileUrl: formFileUrl.trim() || null,
        isPublished: formIsPublished,
      });

      setSelectedLesson(updated);
      setFormSuccess(true);

      // Update structure locally
      if (structure) {
        setStructure({
          ...structure,
          modules: structure.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) => (l.id === updated.id ? updated : l)),
          })),
        });
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Không thể lưu bài học.');
    } finally {
      setFormSaving(false);
    }
  }

  // 5. File upload handler
  async function handleFileUpload(file: File) {
    if (!selectedLessonId) return;

    // Client-side validations
    const isVideo = formContentType === 'VIDEO';
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB vs 10MB
    const allowedTypes = isVideo
      ? ['video/mp4', 'video/webm']
      : ['application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        isVideo
          ? 'Định dạng video không được hỗ trợ. Vui lòng chọn tệp .mp4 hoặc .webm.'
          : 'Định dạng không được hỗ trợ. Vui lòng chọn tệp PDF (.pdf).',
      );
      return;
    }

    if (file.size > maxSize) {
      setUploadError(
        isVideo
          ? 'Kích thước video vượt quá giới hạn 100 MB. Vui lòng nén lại hoặc dùng link YouTube.'
          : 'Kích thước tài liệu PDF vượt quá giới hạn 10 MB.',
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const result = await uploadLessonFile(selectedLessonId, file, (percent) => {
        setUploadProgress(percent);
      });

      setFormFileUrl(result.lesson.fileUrl ?? '');

      // Refresh lesson
      const refreshed = await getAdminLesson(selectedLessonId);
      setSelectedLesson(refreshed);

      if (structure) {
        setStructure({
          ...structure,
          modules: structure.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) => (l.id === refreshed.id ? refreshed : l)),
          })),
        });
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Tải lên tệp thất bại.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }

  // 6. Module Operations
  function handleOpenAddModule() {
    setEditingModule(null);
    setModuleTitleInput('');
    setModuleError(null);
    setIsModuleModalOpen(true);
  }

  function handleOpenEditModule(mod: AdminModuleDto) {
    setEditingModule(mod);
    setModuleTitleInput(mod.title);
    setModuleError(null);
    setIsModuleModalOpen(true);
  }

  async function handleModuleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourseId || !moduleTitleInput.trim()) return;

    setModuleSubmitting(true);
    setModuleError(null);
    try {
      if (editingModule) {
        await updateModule(editingModule.id, { title: moduleTitleInput.trim() });
      } else {
        await createModule(selectedCourseId, { title: moduleTitleInput.trim() });
      }
      setIsModuleModalOpen(false);
      // Reload structure
      const updatedStructure = await getCourseStructure(selectedCourseId);
      setStructure(updatedStructure);
    } catch (err: unknown) {
      setModuleError(err instanceof Error ? err.message : 'Có lỗi khi lưu module.');
    } finally {
      setModuleSubmitting(false);
    }
  }

  async function handleMoveModule(index: number, direction: 'up' | 'down') {
    if (!structure || !selectedCourseId) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= structure.modules.length) return;

    const nextModules = [...structure.modules];
    const cur = nextModules[index]!;
    const tar = nextModules[targetIndex]!;
    nextModules[index] = tar;
    nextModules[targetIndex] = cur;

    setStructure({ ...structure, modules: nextModules });
    try {
      await reorderModules(selectedCourseId, nextModules.map((m) => m.id));
    } catch {
      // Revert on error
      const reload = await getCourseStructure(selectedCourseId);
      setStructure(reload);
    }
  }

  // 7. Lesson Operations
  function handleOpenAddLesson(moduleId: string) {
    setTargetModuleId(moduleId);
    setNewLessonTitle('');
    setNewLessonType('VIDEO');
    setLessonError(null);
    setIsAddLessonModalOpen(true);
  }

  async function handleAddLessonSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetModuleId || !newLessonTitle.trim()) return;

    setLessonSubmitting(true);
    setLessonError(null);
    try {
      const created = await createLesson(targetModuleId, {
        title: newLessonTitle.trim(),
        contentType: newLessonType,
        isPublished: false,
      });

      setIsAddLessonModalOpen(false);
      if (selectedCourseId) {
        const updatedStructure = await getCourseStructure(selectedCourseId);
        setStructure(updatedStructure);
      }
      handleSelectLesson(created.id);
    } catch (err: unknown) {
      setLessonError(err instanceof Error ? err.message : 'Không thể tạo bài học.');
    } finally {
      setLessonSubmitting(false);
    }
  }

  async function handleMoveLesson(moduleId: string, lessonIndex: number, direction: 'up' | 'down') {
    if (!structure) return;
    const targetModule = structure.modules.find((m) => m.id === moduleId);
    if (!targetModule) return;

    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    if (targetIndex < 0 || targetIndex >= targetModule.lessons.length) return;

    const nextLessons = [...targetModule.lessons];
    const cur = nextLessons[lessonIndex]!;
    const tar = nextLessons[targetIndex]!;
    nextLessons[lessonIndex] = tar;
    nextLessons[targetIndex] = cur;

    setStructure({
      ...structure,
      modules: structure.modules.map((m) => (m.id === moduleId ? { ...m, lessons: nextLessons } : m)),
    });

    try {
      await reorderLessons(moduleId, nextLessons.map((l) => l.id));
    } catch {
      if (selectedCourseId) {
        const reload = await getCourseStructure(selectedCourseId);
        setStructure(reload);
      }
    }
  }

  // 8. Delete Confirm handler
  async function handleConfirmDelete() {
    if (!deletingItem) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (deletingItem.type === 'module') {
        await deleteModule(deletingItem.id);
      } else {
        await deleteLesson(deletingItem.id);
        if (selectedLessonId === deletingItem.id) {
          setSelectedLessonId(null);
          setSelectedLesson(null);
        }
      }
      setDeletingItem(null);
      if (selectedCourseId) {
        const reload = await getCourseStructure(selectedCourseId);
        setStructure(reload);
      }
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : 'Không thể xóa mục này (có thể do bài kiểm tra đã có học viên nộp bài).',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const currentCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      {/* InfoBanner */}
      <InfoBanner targetScreen="Giao diện học tập" />

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
            <Link href="/admin" className="hover:text-admin-primary">
              Quản trị
            </Link>
            <span>›</span>
            <Link href="/admin/courses" className="hover:text-admin-primary">
              Khóa học
            </Link>
            <span>›</span>
            <span className="font-semibold text-slate-800 line-clamp-1 max-w-xs">
              {currentCourse?.title || 'Đang tải…'}
            </span>
            <span>›</span>
            <span className="text-admin-primary font-medium">Bài học</span>
          </nav>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-admin-navy">
            Soạn module và bài học
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Course Selector */}
          <select
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 focus-visible:border-admin-primary focus-visible:outline-none max-w-xs"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {/* Client Preview Button */}
          {selectedLessonId ? (
            <Link
              href={`/admin/lessons/${selectedLessonId}/preview?courseId=${selectedCourseId}`}
              className={buttonStyles({
                variant: 'admin-outline',
                size: 'md',
              })}
            >
              👁 Xem trước ở client
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className={buttonStyles({
                variant: 'admin-outline',
                size: 'md',
              })}
            >
              👁 Xem trước ở client
            </button>
          )}

          {/* Save Button */}
          <Button
            type="button"
            variant="admin-primary"
            size="md"
            disabled={!selectedLessonId || formSaving}
            onClick={() => handleSaveLesson()}
          >
            {formSaving ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </div>
      </div>

      {globalError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          {globalError}
        </div>
      )}

      {/* Two Column Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: StructureTree (col-span-5) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-admin-navy">Cấu trúc</h2>
              <p className="text-xs text-slate-500">Kéo sắp xếp hoặc điều chỉnh thứ tự bài</p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddModule}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-admin-navy hover:bg-slate-200 transition-colors"
            >
              + Thêm module
            </button>
          </div>

          {loadingStructure ? (
            <div className="p-8 text-center text-xs text-slate-400 italic">
              Đang tải cấu trúc khóa học…
            </div>
          ) : !structure || structure.modules.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Khóa học chưa có module nào. Hãy bấm <strong>+ Thêm module</strong> để bắt đầu.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {structure.modules.map((mod, modIdx) => (
                <div
                  key={mod.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3"
                >
                  {/* Module Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">
                        {modIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">
                        {mod.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Move buttons */}
                      <button
                        type="button"
                        disabled={modIdx === 0}
                        onClick={() => handleMoveModule(modIdx, 'up')}
                        className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Di chuyển lên"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={modIdx === structure.modules.length - 1}
                        onClick={() => handleMoveModule(modIdx, 'down')}
                        className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Di chuyển xuống"
                      >
                        ▼
                      </button>

                      {/* Edit title */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModule(mod)}
                        className="rounded p-1 text-slate-400 hover:text-admin-primary"
                        title="Đổi tên module"
                      >
                        ✏️
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() =>
                          setDeletingItem({
                            type: 'module',
                            id: mod.id,
                            title: mod.title,
                          })
                        }
                        className="rounded p-1 text-slate-400 hover:text-rose-600"
                        title="Xóa module"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Lessons list inside module */}
                  <div className="space-y-1.5 pl-3 border-l-2 border-slate-200">
                    {mod.lessons.length === 0 ? (
                      <p className="py-2 text-[11px] text-slate-400 italic">
                        Chưa có bài học nào trong module này.
                      </p>
                    ) : (
                      mod.lessons.map((lesson, lIdx) => {
                        const isSelected = selectedLessonId === lesson.id;
                        return (
                          <div
                            key={lesson.id}
                            className={cn(
                              'group flex items-center justify-between gap-2 rounded-lg p-2 text-xs transition-all cursor-pointer',
                              isSelected
                                ? 'bg-white font-medium text-admin-primary shadow-xs border border-admin-primary/30 ring-1 ring-admin-primary/10'
                                : 'text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent',
                            )}
                            onClick={() => handleSelectLesson(lesson.id)}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-slate-400">
                                {lesson.contentType === 'VIDEO' ? '🎬' : '📄'}
                              </span>
                              <span className="truncate">{lesson.title}</span>
                              {lesson.isPublished ? (
                                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" title="Đã xuất bản" />
                              ) : (
                                <span className="size-1.5 rounded-full bg-slate-300 shrink-0" title="Bản nháp" />
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              <button
                                type="button"
                                disabled={lIdx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveLesson(mod.id, lIdx, 'up');
                                }}
                                className="rounded px-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                                title="Lên"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={lIdx === mod.lessons.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveLesson(mod.id, lIdx, 'down');
                                }}
                                className="rounded px-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                                title="Xuống"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingItem({
                                    type: 'lesson',
                                    id: lesson.id,
                                    title: lesson.title,
                                  });
                                }}
                                className="rounded px-1 text-slate-400 hover:text-rose-600"
                                title="Xóa bài học"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenAddLesson(mod.id)}
                      className="mt-2 w-full rounded-lg border border-dashed border-slate-300 py-1.5 text-center text-xs font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-800 transition-colors"
                    >
                      + Thêm bài học
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: LessonForm (col-span-7) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          {!selectedLessonId ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="size-12 mb-3 text-slate-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              <h3 className="font-semibold text-slate-700">Chưa chọn bài học</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                Vui lòng chọn một bài học từ cấu trúc bên trái hoặc tạo bài học mới để bắt đầu thiết
                lập nội dung.
              </p>
            </div>
          ) : loadingLesson ? (
            <div className="p-12 text-center text-xs text-slate-400 italic">
              Đang nạp chi tiết bài học…
            </div>
          ) : (
            <form onSubmit={handleSaveLesson} className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-admin-navy">Soạn nội dung bài học</h2>
                <p className="text-xs text-slate-500">
                  Cập nhật tiêu đề, định dạng tài liệu bài giảng và liên kết xem video/tài liệu
                </p>
              </div>

              {formSuccess && (
                <div
                  role="status"
                  className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"
                >
                  ✓ Đã lưu thay đổi bài học thành công.
                </div>
              )}

              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
                >
                  {formError}
                </div>
              )}

              {/* Lesson Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Tên bài học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="[Tên bài]"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus-visible:border-admin-primary focus-visible:outline-none"
                />
              </div>

              {/* Content Type Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Định dạng bài học
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setFormContentType('VIDEO')}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all',
                      formContentType === 'VIDEO'
                        ? 'border-admin-primary bg-admin-primary/5 text-admin-primary ring-1 ring-admin-primary'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <span>🎬</span> Video bài giảng
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormContentType('PDF')}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all',
                      formContentType === 'PDF'
                        ? 'border-admin-primary bg-admin-primary/5 text-admin-primary ring-1 ring-admin-primary'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <span>📄</span> Tài liệu PDF
                  </button>
                </div>
              </div>

              {/* Content Upload / Source Configuration */}
              {formContentType === 'VIDEO' ? (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">Nguồn video</span>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setVideoMode('youtube')}
                        className={cn(
                          'rounded-md px-2.5 py-1 font-medium transition-colors',
                          videoMode === 'youtube'
                            ? 'bg-admin-navy text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100',
                        )}
                      >
                        Link YouTube
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoMode('upload')}
                        className={cn(
                          'rounded-md px-2.5 py-1 font-medium transition-colors',
                          videoMode === 'upload'
                            ? 'bg-admin-navy text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100',
                        )}
                      >
                        Tải tệp MP4
                      </button>
                    </div>
                  </div>

                  {videoMode === 'youtube' ? (
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        Đường dẫn video YouTube (hỗ trợ cả unlisted)
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={formFileUrl}
                        onChange={(e) => setFormFileUrl(e.target.value)}
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm focus-visible:border-admin-primary focus-visible:outline-none"
                      />
                      <p className="mt-1 text-[11px] text-slate-500">
                        Phù hợp cho các video dung lượng lớn hơn 100 MB.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* Dropzone for video */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />

                      <div
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={cn(
                          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer',
                          isUploading
                            ? 'border-admin-primary bg-admin-primary/5 cursor-wait'
                            : 'border-slate-300 bg-white hover:border-admin-primary hover:bg-slate-50',
                        )}
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="size-8 text-slate-400 mb-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                          />
                        </svg>
                        <p className="text-xs font-semibold text-slate-700">
                          {isUploading ? 'Đang tải tệp video lên…' : 'Kéo thả hoặc bấm để chọn video MP4/WebM'}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Dung lượng tối đa 100 MB (lưu trữ Cloudinary)
                        </p>
                      </div>

                      {uploadProgress !== null && (
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs font-medium text-slate-600">
                            <span>Tiến trình tải lên:</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-admin-primary transition-all duration-200"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {formFileUrl && !formFileUrl.includes('youtube') && (
                        <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
                          <span className="truncate text-slate-700 max-w-xs">{formFileUrl}</span>
                          <button
                            type="button"
                            onClick={() => setFormFileUrl('')}
                            className="text-rose-600 hover:underline shrink-0 ml-2"
                          >
                            Xóa tệp
                          </button>
                        </div>
                      )}

                      {uploadError && (
                        <p className="mt-2 text-xs text-rose-600">{uploadError}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* PDF File Dropzone */
                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <span className="text-xs font-semibold text-slate-800">Tệp tài liệu PDF</span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />

                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer',
                      isUploading
                        ? 'border-admin-primary bg-admin-primary/5 cursor-wait'
                        : 'border-slate-300 bg-white hover:border-admin-primary hover:bg-slate-50',
                    )}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="size-8 text-slate-400 mb-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    <p className="text-xs font-semibold text-slate-700">
                      {isUploading ? 'Đang tải tài liệu PDF lên…' : 'Kéo thả hoặc bấm để chọn tệp PDF'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Dung lượng tối đa 10 MB (tự động đưa vào hàng đợi nạp AI)
                    </p>
                  </div>

                  {uploadProgress !== null && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-600">
                        <span>Tiến trình tải lên:</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-admin-primary transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {formFileUrl && (
                    <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
                      <span className="truncate text-slate-700 max-w-xs">{formFileUrl}</span>
                      <button
                        type="button"
                        onClick={() => setFormFileUrl('')}
                        className="text-rose-600 hover:underline shrink-0 ml-2"
                      >
                        Xóa tệp
                      </button>
                    </div>
                  )}

                  {uploadError && (
                    <p className="mt-2 text-xs text-rose-600">{uploadError}</p>
                  )}
                </div>
              )}

              {/* Publish Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    className="size-4 rounded border-slate-300 text-admin-primary focus:ring-admin-primary"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">
                      Xuất bản bài học này
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Học viên đã đăng ký khóa học sẽ thấy bài học này khi khóa học ở trạng thái xuất bản.
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  variant="admin-primary"
                  size="md"
                  disabled={formSaving}
                >
                  {formSaving ? 'Đang lưu…' : 'Lưu thay đổi bài học'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Module Create / Edit Modal */}
      {isModuleModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-admin-navy">
              {editingModule ? 'Chỉnh sửa tên Module' : 'Thêm Module mới'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Module giúp phân chia bài học theo các chủ đề hoặc tuần học
            </p>

            {moduleError && (
              <div
                role="alert"
                className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800"
              >
                {moduleError}
              </div>
            )}

            <form onSubmit={handleModuleModalSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Tên Module <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Module 1: Nhập môn và Cài đặt"
                  value={moduleTitleInput}
                  onChange={(e) => setModuleTitleInput(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus-visible:border-admin-primary focus-visible:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="admin-outline"
                  size="md"
                  disabled={moduleSubmitting}
                  onClick={() => setIsModuleModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="admin-primary"
                  size="md"
                  disabled={moduleSubmitting}
                >
                  {moduleSubmitting ? 'Đang lưu…' : editingModule ? 'Cập nhật' : 'Tạo Module'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {isAddLessonModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-admin-navy">Thêm bài học mới</h2>
            <p className="mt-1 text-xs text-slate-500">
              Điền tên bài học và chọn định dạng tài nguyên ban đầu
            </p>

            {lessonError && (
              <div
                role="alert"
                className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800"
              >
                {lessonError}
              </div>
            )}

            <form onSubmit={handleAddLessonSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Tiêu đề bài học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bài 1: Cấu trúc cơ bản"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus-visible:border-admin-primary focus-visible:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Loại nội dung
                </label>
                <select
                  value={newLessonType}
                  onChange={(e) => setNewLessonType(e.target.value as ContentType)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 focus-visible:border-admin-primary focus-visible:outline-none"
                >
                  <option value="VIDEO">Video bài giảng</option>
                  <option value="PDF">Tài liệu PDF</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="admin-outline"
                  size="md"
                  disabled={lessonSubmitting}
                  onClick={() => setIsAddLessonModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="admin-primary"
                  size="md"
                  disabled={lessonSubmitting}
                >
                  {lessonSubmitting ? 'Đang tạo…' : 'Tạo bài học'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Modal */}
      {deletingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">
              Xác nhận xóa {deletingItem.type === 'module' ? 'Module' : 'bài học'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa{' '}
              <strong className="text-slate-900">{deletingItem.title}</strong>? Thao tác này không
              thể hoàn tác.
            </p>

            {deleteError && (
              <div
                role="alert"
                className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800"
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
                onClick={() => setDeletingItem(null)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="admin-danger"
                size="md"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? 'Đang xóa…' : 'Xác nhận xóa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
