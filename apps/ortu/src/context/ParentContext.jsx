import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { INITIAL_CHILDREN, PARENT } from '../data/parentData.js';
import { initialsOf, nameFromIdentity, toComma } from '../data/format.js';

const ParentContext = createContext(null);

// Menyimpan state bersama portal orang tua: daftar anak, anak terpilih, dan aksi keluar.
export function ParentProvider({ children, onLogout, identity }) {
  const [kids, setKids] = useState(INITIAL_CHILDREN);
  const [selectedId, setSelectedId] = useState(INITIAL_CHILDREN[0].id);

  const addChild = useCallback((form) => {
    const child = {
      id: `anak-${Date.now()}`,
      name: form.name.trim(),
      birthDate: form.birthDate,
      gender: form.gender,
      nik: '-',
      posyandu: form.posyandu,
      bloodType: form.bloodType,
      note: form.note.trim() || 'Tidak ada catatan khusus',
      verified: false,
      hasHistory: false,
      latest: {
        weight: toComma(form.birthWeight),
        height: toComma(form.birthLength),
        head: form.headCircumference ? toComma(form.headCircumference) : '-',
        nutrition: 'Belum ada data',
      },
    };
    setKids((list) => [...list, child]);
    setSelectedId(child.id);
    return child;
  }, []);

  // Nama orang tua mengikuti identitas yang dipakai saat masuk; data lain tetap data contoh.
  const parent = useMemo(() => {
    const name = nameFromIdentity(identity) ?? PARENT.name;
    return { ...PARENT, name, username: name.toLowerCase().replace(/\s+/g, '') };
  }, [identity]);

  const value = useMemo(() => ({
    parent,
    parentInitial: initialsOf(parent.name)[0],
    kids,
    selectedChild: kids.find((k) => k.id === selectedId) ?? kids[0],
    setSelectedId,
    addChild,
    onLogout,
  }), [parent, kids, selectedId, addChild, onLogout]);

  return <ParentContext.Provider value={value}>{children}</ParentContext.Provider>;
}

export function useParent() {
  const ctx = useContext(ParentContext);
  if (!ctx) throw new Error('useParent harus dipakai di dalam ParentProvider');
  return ctx;
}
