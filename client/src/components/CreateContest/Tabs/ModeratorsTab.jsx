import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const ModeratorsTab = ({ moderators, setModerators }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newModEmail, setNewModEmail] = useState('');
    const [newModName, setNewModName] = useState('');

    const handleAddModerator = () => {
        if (!newModEmail.trim()) return;
        setModerators([...moderators, {
            name: newModName.trim() || newModEmail.trim(),
            email: newModEmail.trim(),
            role: 'Moderator',
            isCurrentUser: false,
        }]);
        setNewModEmail('');
        setNewModName('');
        setShowAddModal(false);
    };

    return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Contest moderators</p>
            <button
                onClick={() => setShowAddModal(true)}
                className="text-[13px] text-brand-yellow hover:opacity-80 font-medium flex items-center gap-1"
            >
                <Plus className="w-3.5 h-3.5" /> Add moderator
            </button>
        </div>

        {showAddModal && (
            <div className="flex flex-col gap-3 p-4 border border-white/10 rounded-xl bg-bg-light">
                <input
                    type="text"
                    value={newModName}
                    onChange={(e) => setNewModName(e.target.value)}
                    placeholder="Name (optional)"
                    className="w-full px-3 py-2 bg-card-dark border border-white/10 rounded-lg text-sm text-white placeholder:text-muted"
                />
                <input
                    type="email"
                    value={newModEmail}
                    onChange={(e) => setNewModEmail(e.target.value)}
                    placeholder="Email (required)"
                    className="w-full px-3 py-2 bg-card-dark border border-white/10 rounded-lg text-sm text-white placeholder:text-muted"
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleAddModerator}
                        disabled={!newModEmail.trim()}
                        className="px-3 py-1.5 text-xs font-medium bg-brand-yellow text-bg-dark rounded-lg hover:bg-yellow-300 disabled:opacity-50"
                    >
                        Add
                    </button>
                    <button
                        onClick={() => { setShowAddModal(false); setNewModEmail(''); setNewModName(''); }}
                        className="px-3 py-1.5 text-xs font-medium border border-white/20 text-white rounded-lg hover:bg-white/5"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}

        <div className="flex flex-col gap-2.5">
            {moderators.map((mod, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 border border-white/10 rounded-xl bg-bg-light"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-bg-light border border-white/10 flex items-center justify-center text-xs font-semibold text-muted">
                            {mod.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">{mod.name}</p>
                            <p className="text-xs text-muted">{mod.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-bg-light border border-white/10 text-muted tracking-wide">
                            {mod.role}
                        </span>
                        {mod.role !== 'Owner' && (
                            <button
                                onClick={() => setModerators(moderators.filter((_, j) => j !== i))}
                                className="text-red-400 hover:opacity-70"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
</div>
    </div>
    );
};

export default ModeratorsTab;
