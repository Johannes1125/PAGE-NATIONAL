'use client';

import React, { useEffect } from 'react';
import { X, Sparkles, Calendar, CheckCircle2 } from 'lucide-react';
import { VERSION_UPDATES, VersionUpdate } from '../lib/version-updates';
import './VersionUpdatesModal.css';

interface VersionUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  updates?: VersionUpdate[];
}

export default function VersionUpdatesModal({
  isOpen,
  onClose,
  updates = VERSION_UPDATES,
}: VersionUpdatesModalProps) {
  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="vum-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vum-title"
    >
      <div
        className="vum-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="vum-header">
          <div className="vum-header-content">
            <div className="vum-icon-badge">
              <Sparkles size={18} className="vum-icon" />
            </div>
            <div>
              <h2 id="vum-title" className="vum-title">Version Updates</h2>
              <p className="vum-subtitle">Development changelog & build updates</p>
            </div>
          </div>
          <button
            type="button"
            className="vum-close-btn"
            onClick={onClose}
            aria-label="Close version updates modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="vum-body">
          <div className="vum-timeline">
            {updates.map((item, index) => (
              <div
                key={item.version}
                className={`vum-card ${item.isLatest ? 'vum-card--latest' : ''}`}
              >
                <div className="vum-card-header">
                  <div className="vum-version-wrap">
                    <span className="vum-version-tag">{item.version}</span>
                    {item.isLatest && (
                      <span className="vum-latest-badge">Current Build</span>
                    )}
                  </div>
                  <div className="vum-date">
                    <Calendar size={13} className="vum-date-icon" />
                    <span>{item.date}</span>
                  </div>
                </div>

                <div className="vum-changes-section">
                  <span className="vum-changes-title">Key Changes:</span>
                  <ul className="vum-changes-list">
                    {item.changes.map((change, cIdx) => (
                      <li key={cIdx} className="vum-change-item">
                        <CheckCircle2 size={14} className="vum-change-bullet" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="vum-footer">
          <span className="vum-footer-text">PAGE National Portal · In Development</span>
          <button
            type="button"
            className="vum-dismiss-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
