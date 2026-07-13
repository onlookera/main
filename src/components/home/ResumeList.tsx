import React from 'react';
import { Resume } from '../../types';
import { Edit, Trash2, Copy, FileText, Clock } from 'lucide-react';

interface Props {
  resumes: Resume[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const ResumeList: React.FC<Props> = ({ resumes, onEdit, onDelete, onDuplicate }) => {
  if (resumes.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}天前`;
    return d.toLocaleDateString('zh-CN');
  };

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Clock size={20} className="text-gray-500" />
        我的简历
        <span className="text-sm font-normal text-gray-400">({resumes.length})</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 text-sm truncate">{resume.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  更新于 {formatDate(resume.updatedAt)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  模板: {resume.templateId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => onEdit(resume.id)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Edit size={13} />
                编辑
              </button>
              <button
                onClick={() => onDuplicate(resume.id)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
              >
                <Copy size={13} />
                复制
              </button>
              <button
                onClick={() => {
                  if (confirm('确定要删除这份简历吗？此操作不可恢复。')) {
                    onDelete(resume.id);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={13} />
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeList;
