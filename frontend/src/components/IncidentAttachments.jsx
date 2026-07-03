import React from 'react';
import { ExternalLink, Image as ImageIcon, Video } from 'lucide-react';
import { mediaUrl } from '../utils/api';

export default function IncidentAttachments({ media = [], darkMode = false }) {
  if (!media.length) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: darkMode ? '#cbd5e1' : '#334155', marginBottom: 10 }}>
        Attachments
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {media.map((item, index) => {
          const url = mediaUrl(item.url);
          const isImage = item.type === 'image';
          return (
            <a
              key={`${item.id || item.url || item.filename || 'media'}-${index}`}
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'block',
                minWidth: 0,
                borderRadius: 8,
                overflow: 'hidden',
                border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
                color: darkMode ? '#f8fafc' : '#0f172a',
                textDecoration: 'none'
              }}
            >
              <div style={{ aspectRatio: '16 / 10', backgroundColor: darkMode ? '#020617' : '#e2e8f0' }}>
                {isImage ? (
                  <img
                    src={url}
                    alt={item.filename || 'Report attachment'}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                ) : (
                  <video
                    src={url}
                    controls
                    preload="metadata"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
                {isImage ? <ImageIcon size={16} /> : <Video size={16} />}
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.filename || (isImage ? 'Image attachment' : 'Video attachment')}
                </span>
                <ExternalLink size={14} style={{ flexShrink: 0, color: darkMode ? '#94a3b8' : '#64748b' }} />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
