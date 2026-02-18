import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const MultiColorProfileAvatar = ({ name, size = 130 }) => {
  const letter = (name?.charAt(0) || 'U').toUpperCase();
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  ];
  const idx = letter.charCodeAt(0) % gradients.length;
  return (
    <Avatar sx={{
      background: gradients[idx], color: 'white',
      width: size, height: size, fontSize: size / 2.5, fontWeight: 800,
      border: '4px solid rgba(255,255,255,0.15)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)', mx: 'auto',
    }}>{letter}</Avatar>
  );
};

// Auto-calculates risk from portfolio holdings
const calcRiskFromPortfolio = (investments) => {
  if (!investments || investments.length === 0) return null;

  const totalValue = investments.reduce((s, i) => s + (i.current_value || 0), 0);
  if (totalValue === 0) return null;

  const equityTypes = ['stock', 'etf'];
  const debtTypes = ['bond', 'mutual_fund'];

  const equityValue = investments
    .filter(i => equityTypes.includes(i.asset_type))
    .reduce((s, i) => s + (i.current_value || 0), 0);
  const debtValue = investments
    .filter(i => debtTypes.includes(i.asset_type))
    .reduce((s, i) => s + (i.current_value || 0), 0);

  const equityPct = (equityValue / totalValue) * 100;
  const debtPct   = (debtValue / totalValue) * 100;

  if (equityPct >= 65) return { profile: 'aggressive', equityPct, debtPct };
  if (equityPct >= 35) return { profile: 'moderate',   equityPct, debtPct };
  return { profile: 'conservative', equityPct, debtPct };
};

const RISK_META = {
  conservative: {
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    icon: <SecurityIcon sx={{ fontSize: 26 }} />,
    label: 'Conservative',
    desc: 'Capital preservation is your priority. Best suited for FDs, debt funds, bonds, and blue-chip dividend stocks with minimal volatility.',
    allocation: { Equity: { v: 20, c: '#3b82f6' }, Debt: { v: 60, c: '#8b5cf6' }, Gold: { v: 15, c: '#f59e0b' }, Cash: { v: 5, c: '#10b981' } },
  },
  moderate: {
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    icon: <AssessmentIcon sx={{ fontSize: 26 }} />,
    label: 'Moderate',
    desc: 'Steady growth with manageable risk. A balanced 60/40 equity-debt mix aligns with your financial goals.',
    allocation: { Equity: { v: 60, c: '#3b82f6' }, Debt: { v: 30, c: '#8b5cf6' }, Gold: { v: 7, c: '#f59e0b' }, Cash: { v: 3, c: '#10b981' } },
  },
  aggressive: {
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    icon: <TrendingUpIcon sx={{ fontSize: 26 }} />,
    label: 'Aggressive',
    desc: 'High volatility tolerance for maximum returns. Direct equity, small-caps, and growth funds suit your profile.',
    allocation: { Equity: { v: 85, c: '#3b82f6' }, Debt: { v: 10, c: '#8b5cf6' }, Gold: { v: 3, c: '#f59e0b' }, Cash: { v: 2, c: '#10b981' } },
  },
};

const textFieldStyle = {
  '& .MuiInputBase-input': { color: 'white' },
  '& .MuiInputLabel-root': { color: '#94a3b8' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#1e293b' },
    '&:hover fieldset': { borderColor: '#3b82f6' },
    '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: 2 },
  },
  '& .MuiInputBase-input:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0 100px #0f172a inset',
    WebkitTextFillColor: 'white',
  },
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState(null); // { profile, equityPct, debtPct }
  const [calcError, setCalcError]   = useState('');

  const [name, setName] = useState('');
  const [riskProfile, setRiskProfile] = useState('moderate');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [pwdSaving, setPwdSaving]             = useState(false);
  const [pwdError, setPwdError]               = useState('');
  const [pwdSuccess, setPwdSuccess]           = useState('');

  const token = localStorage.getItem('token');

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name || '');
        setRiskProfile(data.risk_profile || 'moderate');
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Auto-calculates risk profile from live portfolio data then saves it
  const autoCalculateRisk = async () => {
    setCalculating(true);
    setCalcError('');
    setCalcResult(null);
    try {
      const res = await fetch(`${API_BASE}/portfolio`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch portfolio');
      const investments = await res.json();

      const result = calcRiskFromPortfolio(investments);
      if (!result) {
        setCalcError('Add some investments first — your risk profile is calculated from your actual portfolio composition.');
        setCalculating(false);
        return;
      }

      setCalcResult(result);
      setRiskProfile(result.profile);

      // Auto-save
      await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, risk_profile: result.profile }),
      });

      await loadProfile();
    } catch (err) {
      setCalcError('Could not calculate risk profile. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, risk_profile: riskProfile }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        await loadProfile();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    setPwdError(''); setPwdSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) { setPwdError('Please fill all fields.'); return; }
    if (newPassword.length < 6) { setPwdError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setPwdError('Passwords do not match.'); return; }
    setPwdSaving(true);
    try {
      const res = await fetch(`${API_BASE}/profile/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwdSuccess('Password changed successfully!');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        setPwdError(data.detail || 'Failed to change password.');
      }
    } catch { setPwdError('Network error. Please try again.'); }
    finally { setPwdSaving(false); }
  };

  useEffect(() => { loadProfile(); }, []);

  if (loading) return (
    <Box sx={{ p: 3, pt: 12, textAlign: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)' }}>
      <Typography sx={{ color: 'white' }}>Loading profile...</Typography>
    </Box>
  );

  const meta = RISK_META[riskProfile] || RISK_META.moderate;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : '';

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', pt: 12, px: { xs: 2, md: 4 }, pb: 6 }}>
      <Typography variant="h3" fontWeight={800} sx={{ mb: 1, background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        My Profile
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#94a3b8' }}>
        Manage your wealth management profile, security, and investment preferences
      </Typography>

      <Grid container spacing={3}>

        {/* ── Left: Profile Card ── */}
        <Grid item xs={12} md={4}>
          <Paper sx={{
            p: 4,
            background: 'linear-gradient(160deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.12) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'sticky',
            top: 100,
            overflow: 'hidden',
          }}>
            {/* Glow blob */}
            <Box sx={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${meta.color}20 0%, transparent 70%)`, transition: 'background 0.5s', pointerEvents: 'none' }} />

            {/* Avatar centered */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3, position: 'relative' }}>
              <Box sx={{
                position: 'relative', display: 'inline-flex', mb: 2.5,
                '&::before': {
                  content: '""', position: 'absolute', inset: -5, borderRadius: '50%',
                  background: `conic-gradient(${meta.color}, #3b82f6, #8b5cf6, ${meta.color})`,
                  opacity: 0.55, filter: 'blur(3px)',
                  animation: 'spinRing 6s linear infinite',
                  '@keyframes spinRing': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
                },
              }}>
                <MultiColorProfileAvatar name={profile?.name} size={130} />
              </Box>

              <Typography variant="h4" fontWeight={800} sx={{ color: 'white', mb: 0.5 }}>
                {profile?.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <EmailIcon sx={{ color: '#64748b', fontSize: 15 }} />
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>{profile?.email}</Typography>
              </Box>
              {memberSince && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CalendarTodayIcon sx={{ color: '#475569', fontSize: 13 }} />
                  <Typography variant="caption" sx={{ color: '#475569' }}>Member since {memberSince}</Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.08)' }} />

            {/* Risk profile display */}
            <Typography variant="overline" sx={{ color: '#475569', letterSpacing: 2, fontSize: '0.65rem', display: 'block', mb: 2 }}>CURRENT RISK PROFILE</Typography>

            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 2, p: 2.5, borderRadius: 3, mb: 2.5,
              background: `linear-gradient(135deg, ${meta.color}15 0%, ${meta.color}05 100%)`,
              border: `2px solid ${meta.color}44`, transition: 'all 0.4s ease',
            }}>
              <Box sx={{
                width: 50, height: 50, borderRadius: 2, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: meta.gradient, color: 'white',
                boxShadow: `0 6px 16px ${meta.color}50`, transition: 'all 0.4s ease',
              }}>
                {meta.icon}
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'white', lineHeight: 1.2 }}>{meta.label}</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Risk Profile · Auto-Calculated</Typography>
              </Box>
            </Box>

            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', lineHeight: 1.9, mb: 3 }}>
              {meta.desc}
            </Typography>

            {/* Allocation bars */}
            <Typography variant="overline" sx={{ color: '#475569', letterSpacing: 2, fontSize: '0.65rem', display: 'block', mb: 2 }}>SUGGESTED ALLOCATION</Typography>
            {Object.entries(meta.allocation).map(([label, { v, c }]) => (
              <Box key={label} sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>{label}</Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ color: c }}>{v}%</Typography>
                </Box>
                <Box sx={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${v}%`, borderRadius: 3, backgroundColor: c, boxShadow: `0 0 8px ${c}60`, transition: 'width 0.6s ease' }} />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* ── Right Column ── */}
        <Grid item xs={12} md={8}>

          {/* Profile Settings */}
          <Paper sx={{ p: 4, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(10px)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', boxShadow: '0 4px 12px rgba(59,130,246,0.4)' }}>
                <PersonIcon sx={{ color: 'white', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>Profile Settings</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Update your personal information</Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full Name" value={name} onChange={e => setName(e.target.value)} sx={textFieldStyle}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#64748b', fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email Address" value={profile?.email || ''} disabled
                  sx={{ ...textFieldStyle, '& .MuiInputBase-input.Mui-disabled': { color: '#94a3b8', WebkitTextFillColor: '#94a3b8' }, '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: '#1e293b' } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#64748b', fontSize: 20 }} /></InputAdornment> }}
                  helperText={<Typography variant="caption" sx={{ color: '#475569' }}>Email address cannot be changed</Typography>}
                />
              </Grid>
              <Grid item xs={12}>
                {saveSuccess && (
                  <Box sx={{ mb: 2, p: 2, borderRadius: 2, backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <Typography sx={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>✅ Profile saved successfully!</Typography>
                  </Box>
                )}
                <Button fullWidth variant="contained" onClick={updateProfile} disabled={saving}
                  sx={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', '&:hover': { background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }, py: 1.6, fontSize: '1rem', fontWeight: 700, textTransform: 'none', borderRadius: 2, transition: 'all 0.3s' }}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Risk Profile — Auto-Calculated */}
          <Paper sx={{ p: 4, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(10px)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}>
                <AutoAwesomeIcon sx={{ color: 'white', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>Risk Profile</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Auto-calculated from your actual portfolio composition</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.08)' }} />

            {/* How it works */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 3 }}>
              {[
                { label: 'Conservative', sub: '< 35% Equity', color: '#10b981', icon: <SecurityIcon sx={{ fontSize: 18 }} /> },
                { label: 'Moderate', sub: '35–64% Equity', color: '#f59e0b', icon: <AssessmentIcon sx={{ fontSize: 18 }} /> },
                { label: 'Aggressive', sub: '≥ 65% Equity', color: '#ef4444', icon: <TrendingUpIcon sx={{ fontSize: 18 }} /> },
              ].map(item => {
                const active = riskProfile === item.label.toLowerCase();
                return (
                  <Box key={item.label} sx={{
                    p: 2, borderRadius: 2, textAlign: 'center',
                    border: active ? `2px solid ${item.color}` : '1px solid rgba(255,255,255,0.07)',
                    backgroundColor: active ? `${item.color}12` : 'rgba(2,6,23,0.4)',
                    transition: 'all 0.3s',
                  }}>
                    <Box sx={{ color: item.color, mb: 0.5 }}>{item.icon}</Box>
                    <Typography variant="caption" fontWeight={700} sx={{ color: active ? 'white' : '#94a3b8', display: 'block' }}>{item.label}</Typography>
                    <Typography variant="caption" sx={{ color: item.color, fontSize: '0.65rem' }}>{item.sub}</Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Result after calculation */}
            {calcResult && (
              <Box sx={{ p: 2.5, borderRadius: 2, mb: 3, backgroundColor: `${meta.color}0d`, border: `1px solid ${meta.color}33` }}>
                <Typography variant="body2" fontWeight={700} sx={{ color: meta.color, mb: 0.5 }}>
                  ✅ Calculated: {meta.label}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Your portfolio: {calcResult.equityPct.toFixed(1)}% equity · {calcResult.debtPct.toFixed(1)}% debt/MF · saved to your profile
                </Typography>
              </Box>
            )}

            {calcError && (
              <Box sx={{ p: 2, borderRadius: 2, mb: 3, backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <Typography variant="body2" sx={{ color: '#ef4444' }}>⚠️ {calcError}</Typography>
              </Box>
            )}

            <Button fullWidth variant="contained" onClick={autoCalculateRisk} disabled={calculating}
              sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(245,158,11,0.4)' },
                '&.Mui-disabled': { background: 'rgba(255,255,255,0.05)', color: '#475569' },
                py: 1.6, fontSize: '1rem', fontWeight: 700, textTransform: 'none', borderRadius: 2, transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', gap: 1,
              }}>
              {calculating ? (
                <><CircularProgress size={18} sx={{ color: 'white' }} /> Analysing Portfolio...</>
              ) : (
                <><AutoAwesomeIcon sx={{ fontSize: 20 }} /> Auto-Calculate from My Portfolio</>
              )}
            </Button>
          </Paper>

          {/* Change Password */}
          <Paper sx={{ p: 4, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(10px)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', boxShadow: '0 4px 12px rgba(139,92,246,0.4)' }}>
                <LockIcon sx={{ color: 'white', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>Change Password</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Keep your account secure with a strong password</Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth label="Current Password" type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} sx={textFieldStyle}
                  InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowCurrent(!showCurrent)} sx={{ color: '#64748b' }}>{showCurrent ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="New Password" type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} sx={textFieldStyle}
                  InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowNew(!showNew)} sx={{ color: '#64748b' }}>{showNew ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Confirm New Password" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} sx={textFieldStyle}
                  InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirm(!showConfirm)} sx={{ color: '#64748b' }}>{showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> }}
                />
              </Grid>

              {pwdError && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <Typography sx={{ color: '#ef4444', fontSize: '0.9rem' }}>⚠️ {pwdError}</Typography>
                  </Box>
                </Grid>
              )}
              {pwdSuccess && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <Typography sx={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>✅ {pwdSuccess}</Typography>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button fullWidth variant="contained" onClick={changePassword} disabled={pwdSaving}
                  sx={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', '&:hover': { background: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }, py: 1.6, fontSize: '1rem', fontWeight: 700, textTransform: 'none', borderRadius: 2, transition: 'all 0.3s' }}>
                  {pwdSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
