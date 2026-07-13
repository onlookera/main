import React from 'react';
import { Module, PersonalInfoData, PHOTO_SIZE_MAP, PHOTO_SHAPE_STYLE, PhotoSize } from '../../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface Props {
  module: Module;
  globalSettings: {
    primaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    fontSize: number;
    sectionSpacing: number;
    margin: number;
  };
  layout?: string;
}

const ContactItem: React.FC<{
  icon: React.ReactNode; text: string; fontFamily: string; fontSize: number; isDark?: boolean;
}> = ({ icon, text, fontFamily, fontSize, isDark }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: fontSize - 1, fontFamily,
    color: isDark ? 'rgba(255,255,255,0.7)' : '#4b5563',
  }}>
    <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#9ca3af', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
      {icon}
    </span>
    <span style={{ wordBreak: 'break-all' }}>{text}</span>
  </div>
);

const PersonalInfoSection: React.FC<Props> = ({ module, globalSettings, layout }) => {
  const data = module.data as PersonalInfoData;
  const { primaryColor, fontFamily, fontSize } = globalSettings;

  const photoSize: PhotoSize = data.photoSize || 'medium';
  const photoShape = data.photoShape || 'rounded';
  const showPhoto = data.showPhoto !== false;
  const sizeConf = PHOTO_SIZE_MAP[photoSize];
  const photoW = sizeConf.width;
  const photoH = sizeConf.height;
  const borderRadius = PHOTO_SHAPE_STYLE[photoShape];

  const hasAvatar = showPhoto && !!data.avatar;
  const hasContacts = !!(data.email || data.phone || data.location || data.website || data.linkedin || data.github);

  const contactItems: { icon: React.ReactNode; text: string }[] = [];
  if (data.email) contactItems.push({ icon: <Mail size={13} />, text: data.email });
  if (data.phone) contactItems.push({ icon: <Phone size={13} />, text: data.phone });
  if (data.location) contactItems.push({ icon: <MapPin size={13} />, text: data.location });
  if (data.website) contactItems.push({ icon: <Globe size={13} />, text: data.website });
  if (data.linkedin) contactItems.push({ icon: <Linkedin size={13} />, text: data.linkedin });
  if (data.github) contactItems.push({ icon: <Github size={13} />, text: data.github });

  // Reusable photo element
  const photoEl = hasAvatar ? (
    <img
      src={data.avatar}
      alt="照片"
      style={{
        width: photoW,
        height: photoH,
        borderRadius,
        objectFit: 'contain',
        objectPosition: 'center top',
        backgroundColor: '#f3f4f6',
        flexShrink: 0,
      }}
    />
  ) : (
    <div style={{
      width: photoW, height: photoH, borderRadius,
      background: '#f3f4f6',
      border: '2px dashed #d1d5db',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 11, color: '#9ca3af' }}>照片</span>
    </div>
  );

  // ============ Photo-Hero Layout ============
  if (layout === 'photo-hero') {
    return (
      <div style={{ fontFamily, marginBottom: 0 }}>
        <div style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
          padding: `${globalSettings.margin + 16}px ${globalSettings.margin}px ${globalSettings.margin + 8}px`,
          display: 'flex', alignItems: 'center', gap: 28,
        }}>
          {hasAvatar && (
            <img
              src={data.avatar}
              alt="照片"
              style={{
                width: photoW, height: photoH, borderRadius,
                objectFit: 'contain', objectPosition: 'center top',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '3px solid rgba(255,255,255,0.3)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: fontSize + 14, fontWeight: 700, color: '#ffffff',
              letterSpacing: 1, marginBottom: 6, lineHeight: 1.2,
            }}>
              {data.fullName || '姓名'}
            </h1>
            {data.title && (
              <p style={{ fontSize: fontSize + 2, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginBottom: 12 }}>
                {data.title}
              </p>
            )}
            {hasContacts && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px' }}>
                {contactItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: fontSize - 1, color: 'rgba(255,255,255,0.8)' }}>
                    <span style={{ opacity: 0.7 }}>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============ Photo-Top Layout ============
  if (layout === 'photo-top') {
    return (
      <div style={{ fontFamily, marginBottom: globalSettings.sectionSpacing }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 24,
          paddingBottom: globalSettings.sectionSpacing,
          borderBottom: `3px solid ${primaryColor}20`,
          marginBottom: globalSettings.sectionSpacing,
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {hasAvatar ? (
              <img
                src={data.avatar}
                alt="照片"
                style={{
                  width: photoW, height: photoH, borderRadius,
                  objectFit: 'contain', objectPosition: 'center top',
                  backgroundColor: '#f3f4f6',
                  border: `3px solid ${primaryColor}`,
                  boxShadow: `0 4px 16px ${primaryColor}30`,
                }}
              />
            ) : photoEl}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: fontSize + 12, fontWeight: 800, color: primaryColor,
              letterSpacing: 0.5, marginBottom: 4,
            }}>
              {data.fullName || '姓名'}
            </h1>
            {data.title && (
              <p style={{
                fontSize: fontSize + 2, color: '#4b5563', fontWeight: 500,
                marginBottom: 10, paddingLeft: 2,
                borderLeft: `3px solid ${primaryColor}`,
                padding: '4px 0 4px 10px',
              }}>
                {data.title}
              </p>
            )}
            {hasContacts && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px' }}>
                {contactItems.map((item, i) => (
                  <ContactItem key={i} {...item} fontFamily={fontFamily} fontSize={fontSize} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============ Sidebar-Left Layout ============
  if (layout === 'sidebar-left') {
    return (
      <div style={{ fontFamily, marginBottom: globalSettings.sectionSpacing, textAlign: 'center' }}>
        <div style={{
          width: photoW, height: photoH, borderRadius,
          margin: '0 auto 14px', overflow: 'hidden',
          border: `2px solid ${primaryColor}20`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          backgroundColor: '#f3f4f6',
        }}>
          {hasAvatar ? (
            <img
              src={data.avatar}
              alt="照片"
              style={{
                width: '100%', height: '100%',
                objectFit: 'contain', objectPosition: 'center top',
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>照片</span>
            </div>
          )}
        </div>
        <h1 style={{
          fontSize: photoSize === 'xlarge' ? fontSize + 8 : fontSize + 5,
          fontWeight: 700, color: primaryColor,
          marginBottom: 4, letterSpacing: 0.5,
        }}>
          {data.fullName || '姓名'}
        </h1>
        {data.title && (
          <p style={{ fontSize: fontSize, color: '#4b5563', marginBottom: 10, fontWeight: 500 }}>
            {data.title}
          </p>
        )}
        {hasContacts && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', textAlign: 'left' }}>
            {contactItems.map((item, i) => (
              <ContactItem key={i} {...item} fontFamily={fontFamily} fontSize={fontSize} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ============ Sidebar-Right Layout (dark) ============
  if (layout === 'sidebar-right') {
    return (
      <div style={{ fontFamily, marginBottom: globalSettings.sectionSpacing, textAlign: 'center' }}>
        <div style={{
          width: photoW, height: photoH, borderRadius,
          margin: '0 auto 14px', overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.2)',
          backgroundColor: 'rgba(255,255,255,0.1)',
        }}>
          {hasAvatar ? (
            <img
              src={data.avatar}
              alt="照片"
              style={{
                width: '100%', height: '100%',
                objectFit: 'contain', objectPosition: 'center top',
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>照片</span>
            </div>
          )}
        </div>
        <h1 style={{
          fontSize: fontSize + 5, fontWeight: 700,
          color: 'rgba(255,255,255,0.95)',
          marginBottom: 4, letterSpacing: 0.5,
        }}>
          {data.fullName || '姓名'}
        </h1>
        {data.title && (
          <p style={{ fontSize: fontSize, color: 'rgba(255,255,255,0.7)', marginBottom: 10, fontWeight: 500 }}>
            {data.title}
          </p>
        )}
        {hasContacts && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', textAlign: 'left' }}>
            {contactItems.map((item, i) => (
              <ContactItem key={i} {...item} fontFamily={fontFamily} fontSize={fontSize} isDark />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ============ Default (single / timeline) ============
  return (
    <div style={{ fontFamily, marginBottom: globalSettings.sectionSpacing, textAlign: 'center' }}>
      <div style={{
        width: photoW, height: photoH, borderRadius,
        margin: '0 auto 14px', overflow: 'hidden',
        border: `2px solid ${primaryColor}15`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        backgroundColor: '#f3f4f6',
        display: 'block',
      }}>
        {hasAvatar ? (
          <img
            src={data.avatar}
            alt="照片"
            style={{
              width: '100%', height: '100%',
              objectFit: 'contain', objectPosition: 'center top',
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>照片</span>
          </div>
        )}
      </div>
      <h1 style={{
        fontSize: fontSize + 10, fontWeight: 700, color: primaryColor,
        marginBottom: 4, letterSpacing: 1,
      }}>
        {data.fullName || '姓名'}
      </h1>
      {data.title && (
        <p style={{ fontSize: fontSize + 2, color: '#4b5563', marginBottom: 10, fontWeight: 500 }}>
          {data.title}
        </p>
      )}
      {hasContacts && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '6px 22px', fontSize: fontSize - 1, color: '#6b7280',
        }}>
          {contactItems.map((item, i) => (
            <ContactItem key={i} {...item} fontFamily={fontFamily} fontSize={fontSize} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalInfoSection;
