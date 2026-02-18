import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Reusable donut with a centered label
function DonutChart({ data, colors, centerLabel, centerSub, size = 200 }) {
  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <PieChart
        series={[{
          data,
          innerRadius: size * 0.27,
          outerRadius: size * 0.43,
          paddingAngle: 4,
          cornerRadius: 5,
          highlightScope: { faded: 'global', highlighted: 'item' },
        }]}
        width={size}
        height={size}
        margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
        colors={colors}
        slots={{ legend: () => null }}
      />
      {/* Label pinned at exact donut center = size/2, size/2 */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography fontWeight={700} sx={{ color: 'white', fontSize: size * 0.085, lineHeight: 1.2 }}>
          {centerLabel}
        </Typography>
        {centerSub && (
          <Typography sx={{ color: '#94a3b8', fontSize: size * 0.06, lineHeight: 1.2 }}>
            {centerSub}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function Portfolio() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Not updated yet';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const loadInvestments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvestments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const totalValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalInvestment = investments.reduce((sum, inv) => sum + inv.cost_basis, 0);
  const totalGain = totalValue - totalInvestment;
  const gainPercent = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4', '#f97316'];

  const assetAllocationData = investments.length > 0
    ? investments
        .map((inv, idx) => ({
          id: idx,
          value: Math.max(0, inv.current_value),
          label: inv.symbol,
        }))
        .filter((d) => d.value > 0)
    : [];

  const performanceData =
    totalInvestment > 0
      ? totalGain >= 0
        ? [
            { id: 0, value: totalInvestment, label: 'Invested' },
            ...(totalGain > 0 ? [{ id: 1, value: totalGain, label: 'Gains' }] : []),
          ]
        : [
            { id: 0, value: totalValue, label: 'Current Value' },
            { id: 1, value: Math.abs(totalGain), label: 'Loss' },
          ]
      : [];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
        pt: 9,
        px: { xs: 2, md: 4 },
        pb: 4,
      }}
    >
      <Typography variant="h3" fontWeight={700} sx={{ color: 'white', mb: 4 }}>
        Portfolio Overview
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
              Total Value
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              ₹{totalValue.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
              Total Invested
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              ₹{totalInvestment.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              background:
                totalGain >= 0
                  ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                  : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
              Total Gain/Loss
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              ₹{totalGain.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              borderRadius: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: '#020617', mb: 1 }}>
              Return %
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#020617' }}>
              {gainPercent >= 0 ? '+' : ''}
              {gainPercent.toFixed(2)}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Asset Allocation Donut */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.1)',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 600 }}>
              Asset Allocation
            </Typography>
            {assetAllocationData.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <DonutChart
                    data={assetAllocationData}
                    colors={CHART_COLORS}
                    centerLabel={`₹${(totalValue / 1000).toFixed(0)}K`}
                    centerSub="total"
                    size={220}
                  />
                </Box>
                {/* Legend */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5 }}>
                  {assetAllocationData.map((item, i) => (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: '#94a3b8' }}>No investments yet</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Performance Breakdown Donut */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.1)',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 600 }}>
              Performance Breakdown
            </Typography>
            {performanceData.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <DonutChart
                    data={performanceData}
                    colors={totalGain >= 0 ? ['#3b82f6', '#10b981'] : ['#3b82f6', '#ef4444']}
                    centerLabel={`${gainPercent >= 0 ? '+' : ''}${gainPercent.toFixed(1)}%`}
                    centerSub="return"
                    size={220}
                  />
                </Box>
                {/* Legend */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                  {performanceData.map((item, i) => (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor:
                            totalGain >= 0
                              ? ['#3b82f6', '#10b981'][i]
                              : ['#3b82f6', '#ef4444'][i],
                          flexShrink: 0,
                        }}
                      />
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: '#94a3b8' }}>No performance data</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Holdings Details */}
      <Paper
        sx={{
          p: 3,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 600 }}>
          Holdings Details
        </Typography>
        {investments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: '#94a3b8' }}>
              No holdings yet. Add investments to get started!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {investments.map((inv) => {
              const gain = inv.current_value - inv.cost_basis;
              const gainPct = inv.cost_basis > 0 ? (gain / inv.cost_basis) * 100 : 0;
              const isProfit = gain >= 0;
              const gainColor = isProfit ? '#10b981' : '#ef4444';

              // Mini bar chart: Invested vs Current Value
              const miniBarData = [
                { name: 'Invested', value: inv.cost_basis, fill: '#3b82f6' },
                { name: 'Current', value: inv.current_value, fill: isProfit ? '#10b981' : '#ef4444' },
              ];

              const MiniTooltip = ({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <Box sx={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 1, p: 1 }}>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>{label}</Typography>
                      <Typography sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>
                        ₹{Number(payload[0].value).toLocaleString()}
                      </Typography>
                    </Box>
                  );
                }
                return null;
              };

              return (
                <Grid item xs={12} md={6} key={inv.id}>
                  <Box
                    sx={{
                      p: 2.5,
                      backgroundColor: 'rgba(2, 6, 23, 0.6)',
                      borderRadius: 2,
                      border: `1px solid ${isProfit ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      transition: 'all 0.3s',
                      '&:hover': {
                        border: `1px solid ${isProfit ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                        boxShadow: `0 4px 16px ${isProfit ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'}`,
                      },
                    }}
                  >
                    {/* Left: Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
                          {inv.symbol}
                        </Typography>
                        <Typography sx={{
                          color: '#94a3b8',
                          backgroundColor: '#1e293b',
                          px: 0.8,
                          py: 0.2,
                          borderRadius: 0.8,
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                        }}>
                          {inv.asset_type}
                        </Typography>
                      </Box>

                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography sx={{ color: '#64748b', fontSize: '0.7rem' }}>Cost Basis</Typography>
                          <Typography fontWeight={600} sx={{ color: '#f59e0b', fontSize: '0.85rem' }}>
                            ₹{inv.cost_basis.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography sx={{ color: '#64748b', fontSize: '0.7rem' }}>Current Value</Typography>
                          <Typography fontWeight={600} sx={{ color: '#10b981', fontSize: '0.85rem' }}>
                            ₹{inv.current_value.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography sx={{ color: '#64748b', fontSize: '0.7rem' }}>Units</Typography>
                          <Typography fontWeight={600} sx={{ color: 'white', fontSize: '0.85rem' }}>
                            {inv.units}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography sx={{ color: '#64748b', fontSize: '0.7rem' }}>Avg Buy</Typography>
                          <Typography fontWeight={600} sx={{ color: 'white', fontSize: '0.85rem' }}>
                            ₹{inv.avg_buy_price.toLocaleString()}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography sx={{ color: '#475569', fontSize: '0.65rem' }}>
                          Last: ₹{inv.last_price.toLocaleString()}
                          {inv.last_price_at && ` · ${formatLastUpdate(inv.last_price_at)}`}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Right: Mini chart + P&L */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                      {/* P&L badge */}
                      <Box sx={{
                        px: 1.5,
                        py: 0.8,
                        backgroundColor: isProfit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${isProfit ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        borderRadius: 1.5,
                        textAlign: 'center',
                        minWidth: 90,
                      }}>
                        <Typography fontWeight={700} sx={{ color: gainColor, fontSize: '0.95rem' }}>
                          {isProfit ? '+' : ''}{gainPct.toFixed(2)}%
                        </Typography>
                        <Typography sx={{ color: gainColor, fontSize: '0.72rem' }}>
                          {isProfit ? '+' : ''}₹{Math.abs(gain).toLocaleString()}
                        </Typography>
                      </Box>

                      {/* Mini bar chart */}
                      <Box sx={{ width: 90, height: 70 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={miniBarData} barCategoryGap="20%" margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                            <XAxis
                              dataKey="name"
                              tick={{ fill: '#475569', fontSize: 9 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis hide domain={['auto', 'auto']} />
                            <RechartsTooltip content={<MiniTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                              {miniBarData.map((entry, index) => (
                                <Cell key={index} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>
    </Box>
  );
}
