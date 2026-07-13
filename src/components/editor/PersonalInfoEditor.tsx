import React, { useCallback, useRef } from 'react';
import { Module, PersonalInfoData, PhotoSize, PhotoShape, PHOTO_SIZE_LABELS } from '../../types';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github, Camera, Image } from 'lucide-react';

interface Props {
  module: Module;
  onChange: (data: Record<string, any>) => void;
}

const PersonalInfoEditor: React.FC<Props> = ({ module, onChange }) => {
  const data = module.data as PersonalInfoData;
  const fileRef = useRef<HTMLInputElement>(null);

  const update = useCallback(
    (field: keyof PersonalInfoData, value: any) => {
      onChange({ [field]: value });
    },
    [onChange]
  );

  const handleAvatarUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        alert('照片不能超过2MB，请压缩后再上传');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Output: portrait 3:4 ratio, width 300px → 300x400
          const outW = 300;
          const outH = 400;
          canvas.width = outW;
          canvas.height = outH;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // Fill with light gray background
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(0, 0, outW, outH);

            // Calculate fit: contain within 300x400, centered
            const scale = Math.min(outW / img.width, outH / img.height);
            const sw = img.width * scale;
            const sh = img.height * scale;
            const sx = (outW - sw) / 2;
            const sy = (outH - sh) / 2;

            ctx.drawImage(img, sx, sy, sw, sh);
            update('avatar', canvas.toDataURL('image/jpeg', 0.88));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    },
    [update]
  );

  const fields: { key: keyof PersonalInfoData; label: string; icon: React.ReactNode; placeholder: string }[] = [
    { key: 'fullName', label: '姓名', icon: <User size={14} />, placeholder: '你的姓名' },
    { key: 'title', label: '职位头衔', icon: <User size={14} />, placeholder: '如：高级前端工程师' },
    { key: 'email', label: '邮箱', icon: <Mail size={14} />, placeholder: 'your@email.com' },
    { key: 'phone', label: '电话', icon: <Phone size={14} />, placeholder: '138-0000-0000' },
    { key: 'location', label: '所在地', icon: <MapPin size={14} />, placeholder: '北京市' },
    { key: 'website', label: '个人网站', icon: <Globe size={14} />, placeholder: 'your-site.com' },
    { key: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={14} />, placeholder: 'linkedin.com/in/you' },
    { key: 'github', label: 'GitHub', icon: <Github size={14} />, placeholder: 'github.com/you' },
  ];

  const photoSize = data.photoSize || 'medium';
  const photoShape = data.photoShape || 'rounded';
  const showPhoto = data.showPhoto !== false;

  return (
    <div className="space-y-4">
      {/* ---- Photo Upload & Settings ---- */}
      <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <Camera size={16} className="text-blue-600" />
          <h4 className="text-sm font-semibold text-gray-700">照片设置</h4>
        </div>

        {/* Show/Hide toggle */}
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={showPhoto}
            onChange={(e) => update('showPhoto', e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-gray-600">显示照片</span>
        </label>

        {showPhoto && (
          <>
            {/* Photo preview + upload (portrait 3:4 ratio) */}
            <div className="flex items-start gap-4 mb-3">
              {data.avatar ? (
                <img
                  src={data.avatar}
                  alt="照片"
                  style={{
                    width: 64, height: 85,
                    borderRadius: photoShape === 'circle' ? '50%' : photoShape === 'rounded' ? '10px' : '4px',
                    objectFit: 'contain',
                    objectPosition: 'center top',
                    backgroundColor: '#f3f4f6',
                    border: '2px solid #e5e7eb',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: 64, height: 85,
                  borderRadius: photoShape === 'circle' ? '50%' : photoShape === 'rounded' ? '10px' : '4px',
                }} className="bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                  <Image size={20} className="text-gray-400" />
                </div>
              )}
              <div className="space-y-1.5">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  上传照片
                </button>
                {data.avatar && (
                  <button
                    onClick={() => update('avatar', '')}
                    className="block text-xs text-red-500 hover:text-red-600"
                  >
                    移除照片
                  </button>
                )}
                <p className="text-[10px] text-gray-400">建议1寸/2寸证件照，≤1MB</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* Photo Size */}
            <div className="mb-3">
              <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">照片尺寸</label>
              <div className="flex gap-1">
                {(['small', 'medium', 'large', 'xlarge'] as PhotoSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => update('photoSize', size)}
                    className={`flex-1 py-1.5 text-[10px] rounded-md transition-colors ${
                      photoSize === size
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {PHOTO_SIZE_LABELS[size].split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Shape */}
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase mb-1 block">照片形状</label>
              <div className="flex gap-2">
                {([
                  { key: 'circle' as PhotoShape, label: '🔵 圆形' },
                  { key: 'rounded' as PhotoShape, label: '⬜ 圆角' },
                  { key: 'square' as PhotoShape, label: '◼️ 方形' },
                ]).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => update('photoShape', key)}
                    className={`flex-1 py-1.5 text-[11px] rounded-md transition-colors ${
                      photoShape === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ---- Basic Info Fields ---- */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">基本信息</h4>
        <div className="space-y-3">
          {fields.map(({ key, label, icon, placeholder }) => (
            <div key={key}>
              <label className="text-[10px] font-medium text-gray-500 uppercase flex items-center gap-1 mb-0.5">
                {icon}
                {label}
              </label>
              <input
                className="input-field"
                value={(data[key] as string) || ''}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoEditor;
