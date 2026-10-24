'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Timer } from 'lucide-react';
import { useCreateSession } from '@/hooks/useStudy';
import { useObjects } from '@/hooks/useObjects';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import styles from './Study.module.css';

type Mode = 'focus' | 'break';

const FOCUS_OPTIONS = [15, 25, 45, 60];
const BREAK_MINUTES = 5;

function format(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function Pomodoro() {
  const toast = useToast();
  const sessionMutation = useCreateSession();
  const { data: objects = [] } = useObjects({ lifecycle: 'ACTIVE' });
  const targets = objects.filter((o) => o.type === 'TASK' || o.type === 'NOTE');

  const [focusMinutes, setFocusMinutes] = useState(25);
  const [mode, setMode] = useState<Mode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [objectId, setObjectId] = useState('');

  // Mốc kết thúc tuyệt đối → đồng hồ không bị trôi khi tab bị trình duyệt làm chậm
  const endAtRef = useRef<number>(0);
  const startedAtRef = useRef<number>(0);

  const saveSession = async (minutes: number) => {
    if (minutes < 1) return;
    try {
      await sessionMutation.mutateAsync({ minutes, objectId: objectId || undefined });
      toast.success(`Đã ghi ${minutes} phút học tập trung`);
    } catch {
      toast.error('Không lưu được phiên học');
    }
  };

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = Math.round((endAtRef.current - Date.now()) / 1000);
      if (left > 0) {
        setSecondsLeft(left);
        return;
      }
      // Hết giờ
      setRunning(false);
      if (mode === 'focus') {
        void saveSession(focusMinutes);
        setMode('break');
        setSecondsLeft(BREAK_MINUTES * 60);
        toast.info('Hết giờ tập trung. Nghỉ 5 phút nhé!');
      } else {
        setMode('focus');
        setSecondsLeft(focusMinutes * 60);
        toast.info('Hết giờ nghỉ. Sẵn sàng phiên mới!');
      }
    }, 500);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode, focusMinutes]);

  const start = () => {
    endAtRef.current = Date.now() + secondsLeft * 1000;
    startedAtRef.current = Date.now();
    setRunning(true);
  };

  const pause = () => {
    setSecondsLeft(Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000)));
    setRunning(false);
  };

  /** Kết thúc sớm: nếu đã tập trung ≥ 1 phút thì vẫn ghi lại thời gian thật. */
  const finishEarly = async () => {
    const elapsedMin =
      mode === 'focus' ? Math.floor((focusMinutes * 60 - Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000))) / 60) : 0;
    setRunning(false);
    if (mode === 'focus' && elapsedMin >= 1) await saveSession(Math.min(elapsedMin, focusMinutes));
    setMode('focus');
    setSecondsLeft(focusMinutes * 60);
  };

  const changeFocus = (m: number) => {
    setFocusMinutes(m);
    if (!running && mode === 'focus') setSecondsLeft(m * 60);
  };

  const pristine = !running && mode === 'focus' && secondsLeft === focusMinutes * 60;

  return (
    <section className={styles.panel} aria-label="Đồng hồ tập trung">
      <div className={styles.panelTitle}>
        <Timer size={18} color="var(--primary-blue)" />
        Tập trung (Pomodoro)
      </div>

      <div className={`${styles.timer} ${mode === 'break' ? styles.timerBreak : ''}`} role="timer" aria-live="off">
        {format(secondsLeft)}
      </div>
      <div className={styles.timerMode}>{mode === 'focus' ? 'Đang tập trung' : 'Nghỉ giải lao'}</div>

      <div className={styles.controls}>
        {!running ? (
          <Button variant="primary" onClick={start}>
            {pristine ? 'Bắt đầu' : 'Tiếp tục'}
          </Button>
        ) : (
          <Button variant="outline" onClick={pause}>
            Tạm dừng
          </Button>
        )}
        {!pristine && (
          <Button variant="ghost" onClick={finishEarly}>
            {mode === 'focus' ? 'Kết thúc & ghi thời gian' : 'Bỏ qua nghỉ'}
          </Button>
        )}
      </div>

      <label className={styles.field}>
        Thời lượng tập trung
        <select
          className={styles.select}
          value={focusMinutes}
          disabled={running}
          onChange={(e) => changeFocus(Number(e.target.value))}
        >
          {FOCUS_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m} phút
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        Đang học / làm gì? (không bắt buộc)
        <select className={styles.select} value={objectId} disabled={running} onChange={(e) => setObjectId(e.target.value)}>
          <option value="">— Không chọn —</option>
          {targets.map((o) => (
            <option key={o.id} value={o.id}>
              {o.type === 'TASK' ? '✅' : '📝'} {o.title}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.hint}>Giữ tab này mở trong lúc đếm giờ.</div>
    </section>
  );
}
