import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, DollarSign, Users, MousePointerClick, TrendingUp, AlertCircle, Percent, Mail, Info } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export default function Calculator() {
  // 1. Traffic Variables
  const [budget, setBudget] = useState<number>(10000);
  const [cpa, setCpa] = useState<number>(1.50);
  const [organicLeads, setOrganicLeads] = useState<number>(0);
  
  // 1b. Email Variables
  const [emailListSize, setEmailListSize] = useState<number>(5000);
  const [emailOpenRate, setEmailOpenRate] = useState<number>(20);
  const [emailClickRate, setEmailClickRate] = useState<number>(5);
  const [emailConversionRate, setEmailConversionRate] = useState<number>(2);
  const [emailProductPrice, setEmailProductPrice] = useState<number>(47);
  
  // 2. Offer Variables
  const [productPrice, setProductPrice] = useState<number>(97);
  const [oto1Price, setOto1Price] = useState<number>(197);
  const [oto1TakeRate, setOto1TakeRate] = useState<number>(10);
  const [downsell1Price, setDownsell1Price] = useState<number>(97);
  const [downsell1TakeRate, setDownsell1TakeRate] = useState<number>(5);
  const [oto2Price, setOto2Price] = useState<number>(97);
  const [oto2TakeRate, setOto2TakeRate] = useState<number>(5);
  const [downsell2Price, setDownsell2Price] = useState<number>(47);
  const [downsell2TakeRate, setDownsell2TakeRate] = useState<number>(3);
  const [refundRate, setRefundRate] = useState<number>(5);
  const [paymentFee, setPaymentFee] = useState<number>(3); // Standard Stripe is ~2.9% + 30c

  // 3. Conversion Variables
  const [leadToBuyerRate, setLeadToBuyerRate] = useState<number>(1.5);

  // 4. Backend Variables
  const [backendConversionRate, setBackendConversionRate] = useState<number>(5);

  const [cohortPrice, setCohortPrice] = useState<number>(997);
  const [cohortTakeRate, setCohortTakeRate] = useState<number>(2); // % of front-end buyers who ascend
  
  const [coursePrice, setCoursePrice] = useState<number>(297);
  const [courseTakeRate, setCourseTakeRate] = useState<number>(10);

  const [mastermindPrice, setMastermindPrice] = useState<number>(4997);
  const [mastermindTakeRate, setMastermindTakeRate] = useState<number>(0.5);

  const [oneOnOnePrice, setOneOnOnePrice] = useState<number>(9997);
  const [oneOnOneTakeRate, setOneOnOneTakeRate] = useState<number>(0.1);

  // Calculations
  const metrics = useMemo(() => {
    // Traffic & Leads (Paid)
    const paidLeads = budget / (cpa || 1);
    
    // Traffic & Leads (Email)
    const emailOpens = emailListSize * (emailOpenRate / 100);
    const emailClicks = emailOpens * (emailClickRate / 100);
    const emailBuyers = emailClicks * (emailConversionRate / 100);
    const emailRevenue = emailBuyers * emailProductPrice; // Keep for the Email card display
    
    // Total Leads (Funnel)
    const leads = paidLeads + organicLeads;
    
    // Effective CPL based on total budget and total funnel leads
    const cpl = leads > 0 ? budget / leads : 0;
    
    // Offer & AOV
    const oto1Value = oto1Price * (oto1TakeRate / 100);
    const downsell1Value = downsell1Price * (downsell1TakeRate / 100);
    const oto2Value = oto2Price * (oto2TakeRate / 100);
    const downsell2Value = downsell2Price * (downsell2TakeRate / 100);
    const postPurchaseFunnelValue = oto1Value + downsell1Value + oto2Value + downsell2Value;
    
    const funnelFrontendAov = productPrice + postPurchaseFunnelValue;
    const emailFrontendAov = emailProductPrice + postPurchaseFunnelValue;
    
    const frontendAov = funnelFrontendAov; // For Offer Architecture display
    
    // Backend Ascensions
    const courseValuePerBuyer = coursePrice * (courseTakeRate / 100);
    const cohortValuePerBuyer = cohortPrice * (cohortTakeRate / 100);
    const mastermindValuePerBuyer = mastermindPrice * (mastermindTakeRate / 100);
    const oneOnOneValuePerBuyer = oneOnOnePrice * (oneOnOneTakeRate / 100);
    
    const backendValuePerBuyer = courseValuePerBuyer + cohortValuePerBuyer + mastermindValuePerBuyer + oneOnOneValuePerBuyer;
    const funnelTotalAov = funnelFrontendAov + backendValuePerBuyer;
    const emailTotalAov = emailFrontendAov + backendValuePerBuyer;
    
    const feeMultiplier = 1 - (paymentFee / 100);
    const refundMultiplier = 1 - (refundRate / 100);
    
    const netFunnelFrontendAov = (funnelFrontendAov * feeMultiplier) * refundMultiplier;
    const netEmailFrontendAov = (emailFrontendAov * feeMultiplier) * refundMultiplier;
    
    const netBackendValue = (backendValuePerBuyer * feeMultiplier) * refundMultiplier; 
    const netFunnelAov = netFunnelFrontendAov + netBackendValue;
    const netEmailAov = netEmailFrontendAov + netBackendValue;

    // Conversions & Revenue
    const buyers = leads * (leadToBuyerRate / 100);
    const totalBuyers = buyers + emailBuyers;
    
    // Backend logic now uses its own conversion rate, but connects to total leads
    const backendTotalBuyers = leads * (backendConversionRate / 100);
    
    const courseBuyers = backendTotalBuyers * (courseTakeRate / 100);
    const cohortBuyers = backendTotalBuyers * (cohortTakeRate / 100);
    const mastermindBuyers = backendTotalBuyers * (mastermindTakeRate / 100);
    const oneOnOneBuyers = backendTotalBuyers * (oneOnOneTakeRate / 100);
    const backendBuyers = courseBuyers + cohortBuyers + mastermindBuyers + oneOnOneBuyers;
    
    const funnelFrontEndGross = buyers * funnelFrontendAov;
    const emailFrontEndGross = emailBuyers * emailFrontendAov;
    const frontEndGrossRevenue = funnelFrontEndGross + emailFrontEndGross;
    
    const backendGrossRevenue = backendTotalBuyers * backendValuePerBuyer; 
    const grossRevenue = frontEndGrossRevenue + backendGrossRevenue;
    
    const totalAov = totalBuyers > 0 ? grossRevenue / totalBuyers : (backendTotalBuyers > 0 ? grossRevenue / backendTotalBuyers : 0);
    
    // Net Revenue Breakdown
    const funnelNetRevenue = funnelFrontEndGross * feeMultiplier * refundMultiplier;
    const emailNetRevenue = emailFrontEndGross * feeMultiplier * refundMultiplier;
    const backendNetRevenue = backendGrossRevenue * feeMultiplier * refundMultiplier;
    const netRevenue = funnelNetRevenue + emailNetRevenue + backendNetRevenue;
    
    const netTotalAov = totalBuyers > 0 ? netRevenue / totalBuyers : (backendTotalBuyers > 0 ? netRevenue / backendTotalBuyers : 0);
    
    // Profitability
    const grossProfit = grossRevenue - budget;
    const netProfit = netRevenue - budget;
    
    // Unit Economics for Funnel specifically
    const funnelTotalRevenue = funnelFrontEndGross + (backendTotalBuyers * backendValuePerBuyer);
    const epl = leads > 0 ? funnelTotalRevenue / leads : 0;
    const roas = budget > 0 ? grossRevenue / budget : 0;
    
    // Break-even (Using NET AOV because fees/refunds impact true break-even)
    const breakevenCpl = netFunnelAov * (leadToBuyerRate / 100);
    const breakevenCvr = netFunnelAov > 0 ? (cpl / netFunnelAov) * 100 : 0;
    
    // System Status
    const isProfitable = netProfit > 0;
    const isSustainable = epl > cpl;

    return {
      paidLeads: Math.round(paidLeads),
      emailOpens: Math.round(emailOpens),
      emailClicks: Math.round(emailClicks),
      emailBuyers: Math.round(emailBuyers),
      emailRevenue,
      leads: Math.round(leads),
      cpl,
      aov: totalAov,
      frontendAov,
      netFrontendAov: netFunnelFrontendAov,
      netAov: netTotalAov,
      funnelGrossRevenue: frontEndGrossRevenue, // This represents Total FE Gross Revenue
      funnelNetRevenue: frontEndGrossRevenue * feeMultiplier * refundMultiplier, // Total FE Net
      buyers: Math.round(buyers),
      totalBuyers: Math.round(totalBuyers),
      backendBuyers: Math.round(backendBuyers),
      grossRevenue,
      netRevenue,
      grossProfit,
      netProfit,
      epl,
      roas,
      breakevenCpl,
      breakevenCvr,
      isProfitable,
      isSustainable,
      backendTotalBuyers, // Export the new backend specific metric
    };
  }, [budget, cpa, organicLeads, emailListSize, emailOpenRate, emailClickRate, emailConversionRate, emailProductPrice, productPrice, oto1Price, oto1TakeRate, downsell1Price, downsell1TakeRate, oto2Price, oto2TakeRate, downsell2Price, downsell2TakeRate, coursePrice, courseTakeRate, cohortPrice, cohortTakeRate, mastermindPrice, mastermindTakeRate, oneOnOnePrice, oneOnOneTakeRate, refundRate, paymentFee, leadToBuyerRate, backendConversionRate]);

  // Generate Funnel Data for Chart
  const funnelData = useMemo(() => {
    return [
      { stage: "Leads", count: metrics.leads, fill: "hsl(var(--chart-1))" },
      { stage: "Buyers", count: metrics.buyers, fill: "hsl(var(--chart-2))" }
    ];
  }, [metrics]);

  const roasTrendData = useMemo(() => {
    // Generate trend data centered around the current conversion rate
    const data = [];
    // Start 1.5% below current, end 1.5% above, in 0.5% increments
    const startRate = Math.max(0.5, leadToBuyerRate - 1.5);
    for (let i = 0; i <= 6; i++) {
      const currentRate = startRate + (i * 0.5);
      const _buyers = metrics.leads * (currentRate / 100);
      const _totalBuyers = _buyers + metrics.emailBuyers;
      
      // Calculate revenue using the same logic as the main metrics object
      const _funnelFrontEndGross = _buyers * metrics.frontendAov;
      const _emailFrontEndGross = metrics.emailBuyers * (emailProductPrice + (metrics.frontendAov - productPrice));
      
      const backendValuePerBuyer = (coursePrice * (courseTakeRate / 100)) + 
                                   (cohortPrice * (cohortTakeRate / 100)) + 
                                   (mastermindPrice * (mastermindTakeRate / 100)) + 
                                   (oneOnOnePrice * (oneOnOneTakeRate / 100));
                                   
      const _backendGrossRevenue = _totalBuyers * backendValuePerBuyer;
      const _grossRevenue = _funnelFrontEndGross + _emailFrontEndGross + _backendGrossRevenue;
      
      const feeMultiplier = 1 - (paymentFee / 100);
      const refundMultiplier = 1 - (refundRate / 100);
      const _netRevenue = _grossRevenue * feeMultiplier * refundMultiplier;
      
      const _roas = budget > 0 ? _grossRevenue / budget : 0;
      data.push({
        cvr: `${currentRate.toFixed(1)}%`,
        roas: parseFloat(_roas.toFixed(2)),
        profit: Math.round(_netRevenue - budget)
      });
    }
    return data;
  }, [metrics, budget, leadToBuyerRate, emailProductPrice, productPrice, coursePrice, courseTakeRate, cohortPrice, cohortTakeRate, mastermindPrice, mastermindTakeRate, oneOnOnePrice, oneOnOneTakeRate, paymentFee, refundRate]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans selection:bg-primary selection:text-primary-foreground pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 font-mono">Revenue Mechanics Model</h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Design the math before you build the funnel. Adjust inputs to scenario-model your digital product's profitability.
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${metrics.isProfitable ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">
              {metrics.isProfitable ? 'System is Profitable' : 'System is Losing Money'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Inputs Section */}
          <div className="lg:col-span-4 space-y-6">
            
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MousePointerClick className="w-5 h-5 text-chart-1" />
                  Traffic & Leads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="budget" className="text-muted-foreground">Monthly Ad Budget</Label>
                    <span className="text-sm font-mono">{formatCurrency(budget)}</span>
                  </div>
                  <Input 
                    id="budget" 
                    type="number" 
                    value={budget} 
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="cpa" className="text-muted-foreground">Cost Per Acquisition (CPA)</Label>
                    <span className="text-sm font-mono">{formatCurrency(cpa)}</span>
                  </div>
                  <Input 
                    id="cpa" 
                    type="number" 
                    step="0.1"
                    value={cpa} 
                    onChange={(e) => setCpa(Number(e.target.value))}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="paidLeads" className="text-muted-foreground">Paid Leads</Label>
                    <span className="text-sm font-mono">{formatNumber(Math.round(budget / (cpa || 1)))}</span>
                  </div>
                  <Input 
                    id="paidLeads" 
                    type="number" 
                    value={Math.round(budget / (cpa || 1))} 
                    onChange={(e) => setBudget(Number(e.target.value) * (cpa || 1))}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="organic" className="text-muted-foreground">Organic Leads (Monthly)</Label>
                    <span className="text-sm font-mono">{formatNumber(organicLeads)}</span>
                  </div>
                  <Input 
                    id="organic" 
                    type="number" 
                    value={organicLeads} 
                    onChange={(e) => setOrganicLeads(Number(e.target.value))}
                    className="font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-border mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Paid Leads</p>
                    <p className="text-sm font-mono text-chart-1 font-bold">{formatNumber(metrics.paidLeads)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Leads</p>
                    <p className="text-sm font-mono text-chart-1 font-bold">{formatNumber(metrics.leads)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-chart-3" />
                  Email List 
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="emailSize" className="text-muted-foreground">List Size</Label>
                    <span className="text-sm font-mono">{formatNumber(emailListSize)}</span>
                  </div>
                  <Input 
                    id="emailSize" 
                    type="number" 
                    value={emailListSize} 
                    onChange={(e) => setEmailListSize(Number(e.target.value))}
                    className="font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="emailOpenRate" className="text-muted-foreground">Open Rate (%)</Label>
                    <span className="text-sm font-mono">{emailOpenRate}%</span>
                  </div>
                  <Slider 
                    id="emailOpenRate"
                    value={[emailOpenRate]} 
                    max={100} 
                    step={0.1} 
                    onValueChange={(val) => setEmailOpenRate(val[0])} 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="emailClickRate" className="text-muted-foreground">Click Rate (%)</Label>
                    <span className="text-sm font-mono">{emailClickRate}%</span>
                  </div>
                  <Slider 
                    id="emailClickRate"
                    value={[emailClickRate]} 
                    max={100} 
                    step={0.1} 
                    onValueChange={(val) => setEmailClickRate(val[0])} 
                  />
                  <p className="text-xs text-muted-foreground pt-1">% of opens that click</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="emailConversionRate" className="text-muted-foreground">Conversion Rate (%)</Label>
                    <span className="text-sm font-mono">{emailConversionRate}%</span>
                  </div>
                  <Slider 
                    id="emailConversionRate"
                    value={[emailConversionRate]} 
                    max={100} 
                    step={0.1} 
                    onValueChange={(val) => setEmailConversionRate(val[0])} 
                  />
                  <p className="text-xs text-muted-foreground pt-1">% of clicks that buy</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="emailProductPrice" className="text-muted-foreground">Promo Product Price</Label>
                    <span className="text-sm font-mono">{formatCurrency(emailProductPrice)}</span>
                  </div>
                  <Input 
                    id="emailProductPrice" 
                    type="number" 
                    value={emailProductPrice} 
                    onChange={(e) => setEmailProductPrice(Number(e.target.value))}
                    className="font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-border mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Promo Revenue</p>
                    <p className="text-sm font-mono text-chart-2 font-bold">{formatCurrency(metrics.emailRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Promo Buyers</p>
                    <p className="text-sm font-mono text-chart-2">{metrics.emailBuyers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-chart-3" />
                  Front End Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="pt-4 pb-4 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Lead Count</Label>
                    <Input 
                      type="number" 
                      value={metrics.leads}
                      onChange={(e) => {
                        const newTotal = Number(e.target.value);
                        const paid = Math.round(budget / (cpa || 1));
                        setOrganicLeads(newTotal - paid);
                      }}
                      className="font-mono h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">FE Buyers</Label>
                    <div className="flex items-center h-9">
                      <p className="text-lg font-mono text-chart-2 font-bold">{formatNumber(metrics.totalBuyers)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg space-y-4 border border-border/50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="price" className="font-semibold">Front-end Price</Label>
                      <span className="text-sm font-mono">{formatCurrency(productPrice)}</span>
                    </div>
                    <Input 
                      id="price" 
                      type="number" 
                      value={productPrice} 
                      onChange={(e) => setProductPrice(Number(e.target.value))}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between">
                      <Label htmlFor="leadToBuyer" className="text-muted-foreground">Lead → Buyer Conversion (%)</Label>
                      <span className="text-sm font-mono text-chart-2 font-bold">{leadToBuyerRate}%</span>
                    </div>
                    <Slider 
                      id="leadToBuyer"
                      value={[leadToBuyerRate]} 
                      max={100} 
                      step={0.1} 
                      onValueChange={(val) => setLeadToBuyerRate(val[0])} 
                    />
                  </div>
                </div>

                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="oto1Price" className="text-muted-foreground text-xs">OTO 1 Price</Label>
                    <Input id="oto1Price" type="number" value={oto1Price} onChange={(e) => setOto1Price(Number(e.target.value))} className="font-mono text-sm h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oto1TakeRate" className="text-muted-foreground text-xs">OTO 1 Take (%)</Label>
                    <Input id="oto1TakeRate" type="number" value={oto1TakeRate} onChange={(e) => setOto1TakeRate(Number(e.target.value))} className="font-mono text-sm h-9" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label htmlFor="downsell1Price" className="text-muted-foreground text-xs flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" /> Downsell 1 Price
                    </Label>
                    <Input id="downsell1Price" type="number" value={downsell1Price} onChange={(e) => setDownsell1Price(Number(e.target.value))} className="font-mono text-sm h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="downsell1TakeRate" className="text-muted-foreground text-xs">Downsell 1 Take (%)</Label>
                    <Input id="downsell1TakeRate" type="number" value={downsell1TakeRate} onChange={(e) => setDownsell1TakeRate(Number(e.target.value))} className="font-mono text-sm h-9" />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="oto2Price" className="text-muted-foreground text-xs">OTO 2 Price</Label>
                    <Input id="oto2Price" type="number" value={oto2Price} onChange={(e) => setOto2Price(Number(e.target.value))} className="font-mono text-sm h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oto2TakeRate" className="text-muted-foreground text-xs">OTO 2 Take (%)</Label>
                    <Input id="oto2TakeRate" type="number" value={oto2TakeRate} onChange={(e) => setOto2TakeRate(Number(e.target.value))} className="font-mono text-sm h-9" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label htmlFor="downsell2Price" className="text-muted-foreground text-xs flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" /> Downsell 2 Price
                    </Label>
                    <Input id="downsell2Price" type="number" value={downsell2Price} onChange={(e) => setDownsell2Price(Number(e.target.value))} className="font-mono text-sm h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="downsell2TakeRate" className="text-muted-foreground text-xs">Downsell 2 Take (%)</Label>
                    <Input id="downsell2TakeRate" type="number" value={downsell2TakeRate} onChange={(e) => setDownsell2TakeRate(Number(e.target.value))} className="font-mono text-sm h-9" />
                  </div>
                </div>

                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="refunds" className="text-muted-foreground text-xs">Refunds (%)</Label>
                    <Input id="refunds" type="number" value={refundRate} onChange={(e) => setRefundRate(Number(e.target.value))} className="font-mono text-sm h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fees" className="text-muted-foreground text-xs">Payment Fees (%)</Label>
                    <Input id="fees" type="number" step="0.1" value={paymentFee} onChange={(e) => setPaymentFee(Number(e.target.value))} className="font-mono text-sm h-9" />
                  </div>
                </div>

                <div className="pt-2 border-t border-border mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Frontend AOV</p>
                    <p className="text-sm font-mono text-chart-3 font-bold">{formatCurrency(metrics.frontendAov)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Net FE AOV</p>
                    <p className="text-sm font-mono text-chart-3">{formatCurrency(metrics.netFrontendAov)}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Funnel Gross Rev.</p>
                    <p className="text-sm font-mono text-chart-3 font-bold">{formatCurrency(metrics.funnelGrossRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Funnel Net Rev.</p>
                    <p className="text-sm font-mono text-chart-3">{formatCurrency(metrics.funnelNetRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-chart-4" />
                  Backend Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="pt-4 pb-2 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Lead Count</Label>
                    <Input 
                      type="number" 
                      value={metrics.leads}
                      onChange={(e) => {
                        const newTotal = Number(e.target.value);
                        const paid = Math.round(budget / (cpa || 1));
                        setOrganicLeads(newTotal - paid);
                      }}
                      className="font-mono h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">BE Buyers</Label>
                    <div className="flex items-center h-9">
                      <p className="text-lg font-mono text-chart-4 font-bold">{formatNumber(metrics.backendTotalBuyers)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pb-4">
                  <div className="flex justify-between">
                    <Label htmlFor="leadToBuyerBackend" className="text-muted-foreground">Lead → Buyer Conversion (%)</Label>
                    <span className="text-sm font-mono text-chart-2 font-bold">{backendConversionRate}%</span>
                  </div>
                  <Slider 
                    id="leadToBuyerBackend"
                    value={[backendConversionRate]} 
                    max={100} 
                    step={0.1} 
                    onValueChange={(val) => setBackendConversionRate(val[0])} 
                  />
                </div>

                <Separator />

                {/* Course Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium border-b pb-2">Course Program</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coursePrice" className="text-muted-foreground text-xs">Price</Label>
                      <Input 
                        id="coursePrice" 
                        type="number" 
                        value={coursePrice} 
                        onChange={(e) => setCoursePrice(Number(e.target.value))}
                        className="font-mono text-sm h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courseTakeRate" className="text-muted-foreground text-xs">Ascension Rate (%)</Label>
                      <Input 
                        id="courseTakeRate" 
                        type="number" 
                        step="0.1"
                        value={courseTakeRate} 
                        onChange={(e) => setCourseTakeRate(Number(e.target.value))}
                        className="font-mono text-sm h-9"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">Course Revenue</p>
                    <p className="text-sm font-mono text-chart-4 font-bold">{formatCurrency((metrics.backendTotalBuyers) * (coursePrice * (courseTakeRate / 100)))}</p>
                  </div>
                </div>

                {/* Cohort Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium border-b pb-2">Cohort / Group Program</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cohortPrice" className="text-muted-foreground text-xs">Price</Label>
                      <Input 
                        id="cohortPrice" 
                        type="number" 
                        value={cohortPrice} 
                        onChange={(e) => setCohortPrice(Number(e.target.value))}
                        className="font-mono text-sm h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cohortTakeRate" className="text-muted-foreground text-xs">Ascension Rate (%)</Label>
                      <Input 
                        id="cohortTakeRate" 
                        type="number" 
                        step="0.1"
                        value={cohortTakeRate} 
                        onChange={(e) => setCohortTakeRate(Number(e.target.value))}
                        className="font-mono text-sm h-9"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">Cohort Revenue</p>
                    <p className="text-sm font-mono text-chart-4 font-bold">{formatCurrency((metrics.backendTotalBuyers) * (cohortPrice * (cohortTakeRate / 100)))}</p>
                  </div>
                </div>

                {/* Mastermind Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium border-b pb-2">Mastermind</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mastermindPrice" className="text-muted-foreground text-xs">Price</Label>
                      <Input 
                        id="mastermindPrice" 
                        type="number" 
                        value={mastermindPrice} 
                        onChange={(e) => setMastermindPrice(Number(e.target.value))}
                        className="font-mono text-sm h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mastermindTakeRate" className="text-muted-foreground text-xs">Ascension Rate (%)</Label>
                      <Input 
                        id="mastermindTakeRate" 
                        type="number" 
                        step="0.1"
                        value={mastermindTakeRate} 
                        onChange={(e) => setMastermindTakeRate(Number(e.target.value))}
                        className="font-mono text-sm h-9"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">Mastermind Revenue</p>
                    <p className="text-sm font-mono text-chart-4 font-bold">{formatCurrency((metrics.backendTotalBuyers) * (mastermindPrice * (mastermindTakeRate / 100)))}</p>
                  </div>
                </div>

                {/* 1-on-1 Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium border-b pb-2">1-on-1 Consulting</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="oneOnOnePrice" className="text-muted-foreground text-xs">Price</Label>
                      <Input 
                        id="oneOnOnePrice" 
                        type="number" 
                        value={oneOnOnePrice} 
                        onChange={(e) => setOneOnOnePrice(Number(e.target.value))}
                        className="font-mono text-sm h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oneOnOneTakeRate" className="text-muted-foreground text-xs">Ascension Rate (%)</Label>
                      <Input 
                        id="oneOnOneTakeRate" 
                        type="number" 
                        step="0.1"
                        value={oneOnOneTakeRate} 
                        onChange={(e) => setOneOnOneTakeRate(Number(e.target.value))}
                        className="font-mono text-sm h-9"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">1-on-1 Revenue</p>
                    <p className="text-sm font-mono text-chart-4 font-bold">{formatCurrency((metrics.backendTotalBuyers) * (oneOnOnePrice * (oneOnOneTakeRate / 100)))}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border mt-4 grid grid-cols-2 gap-4 bg-primary/5 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Backend AOV</p>
                    <p className="text-sm font-mono text-chart-4 font-bold">{formatCurrency(
                      (coursePrice * (courseTakeRate / 100)) + 
                      (cohortPrice * (cohortTakeRate / 100)) + 
                      (mastermindPrice * (mastermindTakeRate / 100)) + 
                      (oneOnOnePrice * (oneOnOneTakeRate / 100))
                    )}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Net BE AOV</p>
                    <p className="text-sm font-mono text-chart-4">{formatCurrency(
                      ((coursePrice * (courseTakeRate / 100)) + 
                      (cohortPrice * (cohortTakeRate / 100)) + 
                      (mastermindPrice * (mastermindTakeRate / 100)) + 
                      (oneOnOnePrice * (oneOnOneTakeRate / 100))) * 
                      (1 - (paymentFee / 100)) * (1 - (refundRate / 100))
                    )}</p>
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>

          {/* Outputs Section */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col justify-center">
                  <span className="text-sm font-medium text-muted-foreground mb-1">Total Leads</span>
                  <span className="text-2xl font-mono font-bold text-chart-1">{formatNumber(metrics.leads)}</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col justify-center">
                  <span className="text-sm font-medium text-muted-foreground mb-1">FE Buyers</span>
                  <span className="text-2xl font-mono font-bold text-chart-3">{formatNumber(metrics.totalBuyers)}</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col justify-center">
                  <span className="text-sm font-medium text-muted-foreground mb-1">Total Buyers</span>
                  <span className="text-2xl font-mono font-bold text-chart-2">{formatNumber(metrics.totalBuyers + metrics.backendBuyers)}</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col justify-center">
                  <span className="text-sm font-medium text-muted-foreground mb-1">BE Buyers</span>
                  <span className="text-2xl font-mono font-bold text-chart-4">{formatNumber(metrics.backendBuyers)}</span>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/20 md:col-span-2 col-span-2">
                <CardContent className="p-4 flex flex-col justify-center">
                  <span className="text-sm font-medium text-primary mb-1">Total AOV</span>
                  <span className="text-2xl font-mono font-bold">{formatCurrency(metrics.aov)}</span>
                </CardContent>
              </Card>
            </div>

            {/* Main Financials */}
            <Card className="overflow-hidden border-border shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-6 bg-card flex flex-col">
                  <span className="text-sm text-muted-foreground mb-1">Gross Revenue</span>
                  <span className="text-3xl font-mono font-bold tracking-tight">{formatCurrency(metrics.grossRevenue)}</span>
                  <span className="text-sm text-muted-foreground mt-2">Net: {formatCurrency(metrics.netRevenue)}</span>
                </div>
                <div className="p-6 bg-card flex flex-col">
                  <span className="text-sm text-muted-foreground mb-1">Ad Spend</span>
                  <span className="text-3xl font-mono font-bold tracking-tight text-destructive">{formatCurrency(budget)}</span>
                  <span className="text-sm text-muted-foreground mt-2">ROAS: {metrics.roas.toFixed(2)}x</span>
                </div>
                <div className={`p-6 flex flex-col ${metrics.netProfit > 0 ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm font-medium">Net Profit</span>
                    <HoverCard>
                      <HoverCardTrigger>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-3 bg-popover text-popover-foreground shadow-lg border-muted">
                        <p className="text-sm">
                          <strong>Pre-Fee Profit</strong> = Gross Revenue minus Ad Spend.<br/><br/>
                          <strong>Net Profit</strong> = Pre-Fee Profit minus Payment Fees ({paymentFee}%) and Refund Rates ({refundRate}%).<br/><br/>
                          The difference between these two numbers (${formatCurrency(metrics.grossProfit - metrics.netProfit)}) is exactly how much you are losing to merchant fees and refunds.
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <span className={`text-4xl font-mono font-bold tracking-tight ${metrics.netProfit > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formatCurrency(metrics.netProfit)}
                  </span>
                  <span className="text-sm mt-2 opacity-80">
                    Pre-Fee Profit: {formatCurrency(metrics.grossProfit)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Unit Economics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Cost Per Lead (CPL)</span>
                      <span className="font-mono font-medium">{formatCurrency(metrics.cpl)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Earnings Per Lead (EPL)</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${metrics.epl > metrics.cpl ? 'text-emerald-500' : 'text-red-500'}`}>
                          {formatCurrency(metrics.epl)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-muted p-3 rounded-md text-xs mt-2">
                      <p className="font-mono text-muted-foreground">
                        {metrics.epl > metrics.cpl 
                          ? `Healthy. Each lead makes you ${formatCurrency(metrics.epl - metrics.cpl)} in profit.` 
                          : `Warning: EPL < CPL. System bleeds cash. You lose ${formatCurrency(metrics.cpl - metrics.epl)} per lead.`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Survivability Metrics (Break-even)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Break-even CPL</span>
                      <span className="font-mono font-medium">{formatCurrency(metrics.breakevenCpl)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Break-even CVR</span>
                      <span className="font-mono font-medium">{metrics.breakevenCvr.toFixed(2)}%</span>
                    </div>
                    <div className="bg-muted p-3 rounded-md text-xs mt-2">
                      <p className="text-muted-foreground leading-relaxed">
                        To stop losing money, either get your CPL under <strong className="text-foreground">{formatCurrency(metrics.breakevenCpl)}</strong> or push conversion rate above <strong className="text-foreground">{metrics.breakevenCvr.toFixed(2)}%</strong>.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scenario Modeling: CVR vs Profitability</CardTitle>
                <CardDescription>How net profit changes based on Lead → Buyer conversion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={roasTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis 
                        dataKey="cvr" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        yAxisId="left"
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val}`}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val}x`}
                      />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ fontFamily: 'monospace' }}
                        formatter={(value: number, name: string) => {
                          if (name === "Profit") return [formatCurrency(value), name];
                          return [`${value}x`, name];
                        }}
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="profit" name="Profit" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line yAxisId="right" type="monotone" dataKey="roas" name="ROAS" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
