import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LockIcon from '@mui/icons-material/Lock';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const MultiColorProfileAvatar = ({ name, size = 120 }) => {
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
  const gradientIndex = letter.charCodeAt(0) % gradients.length;
  return (
    <Avatar
      sx={{
        background: gradients[gradientIndex],
        color: 'white',
        width: size,
        height: size,
        fontSize: size / 2.5,
        fontWeight: 700,
        border: '4px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {letter}
    </Avatar>
  );
};

const QUESTIONS = [
  {
    id: 'age',
    question: 'What is your age group?',
    options: [
      { label: 'Under 30', score: 3 },
      { label: '30 – 45', score: 2 },
      { label: '46 – 60', score: 1 },
      { label: 'Above 60', score: 0 },
    ],
  },
  {
    id: 'horizon',
    question: 'What is your investment time horizon?',
    options: [
      { label: 'More than 10 years', score: 3 },
      { label: '5 – 10 years', score: 2 },
      { label: '2 – 5 years', score: 1 },
      { label: 'Less than 2 years', score: 0 },
    ],
  },
  {
    id: 'income',
    question: 'How stable is your current income?',
    options: [
      { label: 'Very stable (government/MNC job)', score: 3 },
      { label: 'Mostly stable (private job)', score: 2 },
      { label: 'Variable (freelance/business)', score: 1 },
      { label: 'Uncertain / retired', score: 0 },
    ],
  },
  {
    id: 'loss',
    question: 'If your portfolio dropped 20% in a month, what would you do?',
    options: [
      { label: 'Buy more — great opportunity', score: 3 },
      { label: 'Hold and wait for recovery', score: 2 },
      { label: 'Sell some to reduce exposure', score: 1 },
      { label: 'Sell everything immediately', score: 0 },
    ],
  },
  {
    id: 'goal',
    question: 'What is your primary investment goal?',
    options: [
      { label: 'Maximum wealth growth', score: 3 },
      { label: 'Balanced growth and safety', score: 2 },
      { label: 'Regular income', score: 1 },
      { label: 'Capital preservation', score: 0 },
    ],
  },
  {
    id: 'experience',
    question: 'How would you describe your investing experience?',
    options: [
      { label: 'Expert (F&O, direct equity)', score: 3 },
      { label: 'Experienced (stocks, MFs)', score: 2 },
      { label: 'Beginner (only FD/SIP)', score: 1 },
      { label: 'None at all', score: 0 },
    ],
  },
];

const scoreToProfile = (score) => {
  if (score >= 13) return 'aggressive';
  if (score >= 7) return 'moderate';
  return 'conservative';
};

const getRiskColor = (risk) => {
  if (risk === 'conservative') return '#10b981';
  if (risk === 'moderate') return '#f59e0b';
  if (risk === 'aggressive') return '#ef4444';
  return '#64748b';
};

const getRiskIcon = (risk) => {
  if (risk === 'conservative') return <SecurityIcon />;
  if (risk === 'moderate') return <AssessmentIcon />;
  if (risk === 'aggressive') return <TrendingUpIcon />;
  return null;
};

const getRiskDescription = (risk) => {
  if (risk === 'conservative')
    return 'You prefer capital safety over high returns. Best suited for FDs, debt funds, bonds, and blue-chip dividend stocks.';
  if (risk === 'moderate')
    return 'You seek steady growth with manageable risk. A balanced mix of equity and debt works best for you.';
  if (risk === 'aggressive')
    return 'You are comfortable with high volatility in pursuit of maximum returns. Direct equity, small-caps, and growth funds suit your profile.';
  return '';
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

  const [name, setName] = useState('');
  const [riskProfile, setRiskProfile] = useState('moderate');
  const [kycStatus, setKycStatus] = useState('unverified');

  // password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // quiz
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const token = localStorage.getItem('token');

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name || '');
        setRiskProfile(data.risk_profile || 'moderate');
        setKycStatus(data.kyc_status || 'unverified');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (overrideRisk = null) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          risk_profile: overrideRisk || riskProfile,
          kyc_status: kycStatus,
        }),
      });
      if (res.ok) {
        alert('Profile updated successfully!');
        loadProfile();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPwdError('');
    setPwdSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('Please fill all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirm password do not match.');
      return;
    }
    setPwdSaving(true);
    try {
      const res = await fetch(`${API_BASE}/profile/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwdSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwdError(data.detail || 'Failed to change password.');
      }
    } catch (err) {
      setPwdError('Network error. Please try again.');
    } finally {
      setPwdSaving(false);
    }
  };

  const handleQuizAnswer = (questionId, score) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const submitQuiz = async () => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    const result = scoreToProfile(total);
    setQuizResult(result);
    setRiskProfile(result);
    await updateProfile(result);
  };

  const answeredCount = Object.keys(answers).length;
  const quizComplete = answeredCount === QUESTIONS.length;

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3, pt: 12, textAlign: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)' }}>
        <Typography sx={{ color: 'white' }}>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
      pt: 12,
      px: { xs: 2, md: 4 },
      pb: 6,
    }}>
      <Typography variant="h3" fontWeight={700} sx={{
        mb: 1,
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Professional Profile
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#94a3b8' }}>
        Manage your wealth management profile, security, and investment preferences
      </Typography>

      <Grid container spacing={3}>

        {/* ── Left: Avatar Card ── */}
        <Grid item xs={12} md={4}>
          <Paper sx={{
            p: 4,
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            position: 'sticky',
            top: 100,
          }}>
            <MultiColorProfileAvatar name={profile?.name} />
            <Typography variant="h4" fontWeight={700} sx={{ mt: 3, mb: 1, color: 'white' }}>
              {profile?.name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#94a3b8' }}>
              {profile?.email}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
              <Chip
                icon={<VerifiedUserIcon />}
                label={kycStatus === 'verified' ? 'KYC Verified' : 'KYC Pending'}
                color={kycStatus === 'verified' ? 'success' : 'warning'}
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" sx={{ mb: 2, color: '#94a3b8', fontWeight: 600 }}>
                Current Risk Profile
              </Typography>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                backgroundColor: 'rgba(2,6,23,0.4)',
                borderRadius: 2,
                border: `2px solid ${getRiskColor(riskProfile)}`,
              }}>
                <Box sx={{ color: getRiskColor(riskProfile) }}>{getRiskIcon(riskProfile)}</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white' }}>
                    {riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Risk Profile</Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 2, lineHeight: 1.7 }}>
                {getRiskDescription(riskProfile)}
              </Typography>
            </Box>

            <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>💡 Pro Tip</Typography>
              <Typography variant="caption" sx={{ color: 'white' }}>
                Take the Risk Assessment Quiz to get a profile that matches your actual situation
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* ── Right Column ── */}
        <Grid item xs={12} md={8}>

          {/* Profile Settings */}
          <Paper sx={{
            p: 4,
            backgroundColor: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.1)',
            mb: 3,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <AccountBalanceWalletIcon sx={{ color: '#3b82f6', fontSize: 32 }} />
              <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>Profile Settings</Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={textFieldStyle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <Typography sx={{ color: '#94a3b8' }}>KYC Status</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['unverified', 'verified'].map((s) => (
                      <Chip
                        key={s}
                        label={s.charAt(0).toUpperCase() + s.slice(1)}
                        onClick={() => setKycStatus(s)}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: kycStatus === s
                            ? (s === 'verified' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)')
                            : 'rgba(255,255,255,0.05)',
                          color: kycStatus === s
                            ? (s === 'verified' ? '#10b981' : '#f59e0b')
                            : '#64748b',
                          border: `1px solid ${kycStatus === s ? (s === 'verified' ? '#10b981' : '#f59e0b') : 'transparent'}`,
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => updateProfile()}
                  disabled={saving}
                  sx={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
                    },
                    py: 1.6, fontSize: '1rem', fontWeight: 700,
                    textTransform: 'none', borderRadius: 2, transition: 'all 0.3s',
                  }}
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Change Password */}
          <Paper sx={{
            p: 4,
            backgroundColor: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.1)',
            mb: 3,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <LockIcon sx={{ color: '#8b5cf6', fontSize: 32 }} />
              <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>Change Password</Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  sx={textFieldStyle}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowCurrent(!showCurrent)} sx={{ color: '#64748b' }}>
                          {showCurrent ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  sx={textFieldStyle}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNew(!showNew)} sx={{ color: '#64748b' }}>
                          {showNew ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={textFieldStyle}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm(!showConfirm)} sx={{ color: '#64748b' }}>
                          {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {pwdError && (
                <Grid item xs={12}>
                  <Typography sx={{ color: '#ef4444', fontSize: '0.9rem' }}>⚠️ {pwdError}</Typography>
                </Grid>
              )}
              {pwdSuccess && (
                <Grid item xs={12}>
                  <Typography sx={{ color: '#10b981', fontSize: '0.9rem' }}>✅ {pwdSuccess}</Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={changePassword}
                  disabled={pwdSaving}
                  sx={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
                    },
                    py: 1.6, fontSize: '1rem', fontWeight: 700,
                    textTransform: 'none', borderRadius: 2, transition: 'all 0.3s',
                  }}
                >
                  {pwdSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Risk Assessment Quiz */}
          <Paper sx={{
            p: 4,
            backgroundColor: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <QuizIcon sx={{ color: '#f59e0b', fontSize: 32 }} />
                <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>Risk Assessment Quiz</Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => { setShowQuiz(!showQuiz); setAnswers({}); setQuizResult(null); }}
                sx={{
                  borderColor: '#f59e0b', color: '#f59e0b',
                  textTransform: 'none', fontWeight: 600, borderRadius: 2,
                  '&:hover': { borderColor: '#d97706', backgroundColor: 'rgba(245,158,11,0.1)' },
                }}
              >
                {showQuiz ? 'Cancel' : 'Take Quiz'}
              </Button>
            </Box>

            <Typography variant="body2" sx={{ color: '#94a3b8', mb: showQuiz ? 3 : 0 }}>
              Answer {QUESTIONS.length} quick questions to auto-calculate your ideal risk profile based on your age, income stability, investment horizon, and behaviour.
            </Typography>

            {showQuiz && (
              <Box>
                {/* Progress */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {answeredCount} of {QUESTIONS.length} answered
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {Math.round((answeredCount / QUESTIONS.length) * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(answeredCount / QUESTIONS.length) * 100}
                    sx={{
                      height: 6, borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>

                {/* Questions */}
                {QUESTIONS.map((q, qi) => (
                  <Box key={q.id} sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'white', mb: 2 }}>
                      {qi + 1}. {q.question}
                    </Typography>
                    <Grid container spacing={1.5}>
                      {q.options.map((opt) => {
                        const selected = answers[q.id] === opt.score;
                        return (
                          <Grid item xs={12} sm={6} key={opt.label}>
                            <Box
                              onClick={() => handleQuizAnswer(q.id, opt.score)}
                              sx={{
                                p: 2, borderRadius: 2, cursor: 'pointer',
                                border: selected ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                                backgroundColor: selected ? 'rgba(245,158,11,0.12)' : 'rgba(2,6,23,0.4)',
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: '#f59e0b',
                                  backgroundColor: 'rgba(245,158,11,0.08)',
                                  transform: 'translateY(-1px)',
                                },
                              }}
                            >
                              <Box sx={{
                                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                border: selected ? '2px solid #f59e0b' : '2px solid #334155',
                                backgroundColor: selected ? '#f59e0b' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {selected && <CheckCircleIcon sx={{ fontSize: 14, color: 'white' }} />}
                              </Box>
                              <Typography variant="body2" sx={{ color: selected ? 'white' : '#94a3b8', fontWeight: selected ? 600 : 400 }}>
                                {opt.label}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                ))}

                {/* Result */}
                {quizResult && (
                  <Box sx={{
                    p: 3, borderRadius: 3, mb: 3, textAlign: 'center',
                    border: `2px solid ${getRiskColor(quizResult)}`,
                    backgroundColor: `${getRiskColor(quizResult)}15`,
                  }}>
                    <Box sx={{ color: getRiskColor(quizResult), mb: 1 }}>{getRiskIcon(quizResult)}</Box>
                    <Typography variant="h5" fontWeight={700} sx={{ color: getRiskColor(quizResult), mb: 1 }}>
                      Your Profile: {quizResult.charAt(0).toUpperCase() + quizResult.slice(1)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      {getRiskDescription(quizResult)}
                    </Typography>
                    <Chip
                      label="✅ Saved to your profile"
                      sx={{ mt: 2, backgroundColor: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 600 }}
                    />
                  </Box>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  onClick={submitQuiz}
                  disabled={!quizComplete || saving}
                  sx={{
                    background: quizComplete
                      ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                      : 'rgba(255,255,255,0.1)',
                    color: quizComplete ? 'white' : '#64748b',
                    py: 1.6, fontSize: '1rem', fontWeight: 700,
                    textTransform: 'none', borderRadius: 2, transition: 'all 0.3s',
                    '&:hover': quizComplete ? {
                      background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(217,119,6,0.4)',
                    } : {},
                    '&.Mui-disabled': { color: '#64748b' },
                  }}
                >
                  {saving ? 'Saving...' : quizComplete
                    ? 'Calculate & Save My Risk Profile'
                    : `Answer all ${QUESTIONS.length} questions to continue`}
                </Button>
              </Box>
            )}
          </Paper>

        </Grid>
      </Grid>
    </Box>
  );
}
