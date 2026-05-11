'use client';

import React from 'react';
import { User, UserRole } from '@/types';
import { Users, BarChart3, Eye, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UserManagementProps {
  userSearch: string;
  setUserSearch: (q: string) => void;
  handleSearchUsers: (q: string) => Promise<void>;
  usersList: User[];
  isGlobalAdmin: boolean;
  adminCountries: string[];
  handleImpersonate: (u: User) => Promise<void>;
  setSelectedUser: (u: User) => void;
  setIsManagingRoles: (val: boolean) => void;
  t: any;
}

export function UserManagement({
  userSearch,
  setUserSearch,
  handleSearchUsers,
  usersList,
  isGlobalAdmin,
  adminCountries,
  handleImpersonate,
  setSelectedUser,
  setIsManagingRoles,
  t
}: UserManagementProps) {
  return (
    <section>
       <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0 px-2">
          <div className="flex items-center space-x-2 text-stone-500">
              <Users size={18} />
              <h2 className="text-xs font-black uppercase tracking-widest">{t.admin_users}</h2>
          </div>
          <div className="relative flex-1 max-w-sm md:ml-8">
              <input 
                  type="text" 
                  value={userSearch}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder={t.search_users}
                  className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-2 px-4 pl-10 text-sm font-bold outline-none focus:ring-2 focus:ring-coffee/20"
              />
              <BarChart3 size={16} className="absolute left-3 top-2.5 text-stone-400 rotate-90" />
           </div>
        </div>

        <div className="px-2 mb-4">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t.showing_recent_users}</p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-100 dark:border-stone-800 shadow-sm">
          {usersList.map((u, idx) => (
            <div key={u.id} className={cn(
              "p-5 flex justify-between items-center transition-colors hover:bg-stone-50/50 dark:hover:bg-stone-800/50",
              idx !== usersList.length - 1 ? 'border-b border-stone-50 dark:border-stone-800' : ''
            )}>
               <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm truncate">{u.name || "Anonymous"}</span>
                      {u.is_admin && <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Legacy Admin</span>}
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium truncate">{u.email}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                      {u.roles?.map((r) => (
                          <span key={r.id} className="bg-coffee/10 text-coffee-700 dark:text-coffee-300 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                              {r.role_type}{r.target_id ? `: ${r.target_id}` : ''}
                          </span>
                      ))}
                  </div>
               </div>
               <div className="flex items-center space-x-4 ml-4">
                  <div className="flex flex-col items-end hidden sm:flex">
                     <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter text-stone-500 mb-1">
                       {u.country || "WW"}
                     </span>
                     <span className="text-[8px] text-stone-400 font-bold">{u.created_at?.split(' ')[0]}</span>
                  </div>
                  {(isGlobalAdmin || (adminCountries.length > 0 && u.id === '1bbb4d58-d561-41fa-a4ce-5e6d153a6e89')) && (
                      <div className="flex items-center space-x-2">
                          <button 
                              onClick={() => handleImpersonate(u)}
                              title="Impersonate"
                              className="p-2 bg-stone-50 dark:bg-stone-800 rounded-xl text-stone-400 hover:text-blue-500 transition-all active:scale-90"
                          >
                              <Eye size={18} />
                          </button>
                          {isGlobalAdmin && (
                              <button 
                                  onClick={() => { setSelectedUser(u); setIsManagingRoles(true); }}
                                  className="p-2 bg-stone-50 dark:bg-stone-800 rounded-xl text-stone-400 hover:text-coffee transition-all active:scale-90"
                              >
                                  <Plus size={18} />
                              </button>
                          )}
                      </div>
                  )}
               </div>
            </div>
          ))}
       </div>
    </section>
  );
}
