# Partnership Network Intelligence - Site Architecture & Navigation

**Date:** June 24, 2026  
**Collaboration:** John Michael & Otis  
**Focus:** Complete site map and user flow architecture for PNI prototype

---

## Site Architecture Overview

### **Core Design Philosophy:**
**Single-page application with contextual panels** - keep users in flow while providing access to all PNI systems without page transitions

---

## Primary Navigation Structure

### **Main Application Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  TOP NAVIGATION BAR                                         │
├─────────────────────────────────────────────────────────────┤
│  LEFT SIDEBAR  │         MAIN WORKSPACE        │  RIGHT     │
│                │                               │  PANEL     │
│  - Projects    │  - Active Content Creation    │            │
│  - AI Network  │  - Predictive Workflow        │  - Network │
│  - Settings    │  - Context Management         │    Activity│
│  - Help        │                               │  - Next    │
│                │                               │    Moves   │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Navigation Architecture

### **1. TOP NAVIGATION BAR**

#### **Left Section:**
```
HELIX LOGO | Current Project: "DataPulse AI Campaign" | Workflow: Write(86%) > Design(92%) > Code(74%) > Analyze
```

#### **Right Section:**
```
Search | Notifications | Trust Settings | Profile | Settings
```

### **2. LEFT SIDEBAR (Collapsible)**

#### **2.1 PROJECTS**
```
├─ Current Project
│  └─ DataPulse AI Campaign (Week 6/12)
├─ Recent Projects 
│  ├─ StorAIj Product Launch
│  ├─ HLM Website Redesign
│  └─ Q3 Content Strategy
├─ Project Templates
│  ├─ Product Launch Template
│  ├─ Content Campaign Template
│  └─ Research Project Template
└─ + New Project
```

#### **2.2 AI NETWORK**  
```
├─ Network Overview (4 Active)
│  ├─ Maya (Strategy) - 91% trusted
│  ├─ Devon (Research) - 89% trusted  
│  ├─ Priya (Distribution) - 93% trusted
│  └─ Content AI - 76% trusted
├─ Network Performance
│  └─ Last 30 days analytics
├─ Agent Configuration
│  ├─ Trust Settings per Agent
│  ├─ Specialization Settings
│  └─ Context Sharing Preferences
└─ + Add Custom Agent
```

#### **2.3 SETTINGS**
```
├─ Trust & Safety
│  ├─ Trust Calibration Wizard
│  ├─ Confidence Thresholds
│  ├─ Override Preferences
│  └─ Safety Settings
├─ Context Management
│  ├─ Context Scope Settings
│  ├─ Decision History
│  ├─ Privacy Controls
│  └─ Data Retention
├─ Workflow Preferences
│  ├─ Predictive Logic Settings
│  ├─ Notification Preferences
│  └─ Interface Customization
└─ Account Settings
```

#### **2.4 HELP & LEARNING**
```
├─ Getting Started
│  ├─ PNI Overview
│  ├─ First Project Walkthrough
│  └─ Trust Calibration Guide
├─ Feature Documentation
├─ Video Tutorials
├─ Community & Support
└─ What's New
```

---

## Main Workspace Areas

### **3. CENTER - MAIN WORKSPACE**

#### **3.1 PROJECT DASHBOARD (Default View)**
```
┌─ PROJECT OVERVIEW ────────────────────────────────────┐
│  DataPulse AI Product Launch                         │
│  Week 6 of 12 | Pre-launch Phase                     │
│  Target: PM/Growth Leaders                           │
│                                                      │
│  Context Loaded: 7 prior decisions                  │
│  AI Network Status: 4 agents active                 │
│  Trust Level: High (87% average)                    │
└──────────────────────────────────────────────────────┘

┌─ PREDICTIVE WORKFLOW ────────────────────────────────┐
│  Suggested Next: Write (86% confidence)              │
│  ○ Write → ○ Design → ○ Code → ○ Analyze            │
│                                                      │
│  [ Start Writing ] [ Force Different Path ]         │
└──────────────────────────────────────────────────────┘

┌─ RECENT ACTIVITY ────────────────────────────────────┐
│  • Maya suggested ROI positioning (2 hrs ago)       │
│  • Devon provided market research (4 hrs ago)       │
│  • Content AI completed draft outline (yesterday)   │
│                                                      │
│ [ View All Activity ] [ Export Report ]             │
└──────────────────────────────────────────────────────┘
```

#### **3.2 ACTIVE WORK MODES**

##### **WRITE MODE**
```
┌─ CONTENT CREATION ───────────────────────────────────┐
│                                                      │
│  [Rich Text Editor with AI Collaboration]           │
│                                                      │
│  Real-time AI suggestions appear inline             │
│  Context-aware research from Devon                  │
│  Strategic alignment checks from Maya               │
│                                                      │
└──────────────────────────────────────────────────────┘

┌─ AI COLLABORATION PANEL ────────────────────────────┐
│  Maya: "Consider emphasizing ROI benefits"          │
│  Devon: "Recent study supports efficiency claims"   │
│  Content: "Strengthen opening hook"                 │
│                                                      │
│  [ Apply ] [ Modify ] [ Dismiss ] [ More Info ]    │
└──────────────────────────────────────────────────────┘
```

##### **DESIGN MODE**  
```
┌─ VISUAL PLANNING ────────────────────────────────────┐
│  Content Structure Visualization                     │
│  Format Selection (Blog, Series, Video, etc.)      │
│  Visual Asset Requirements                          │
│                                                      │
│  AI Suggestions:                                    │
│  • Priya: "Consider infographic for data points"   │
│  • Devon: "Visual format increases engagement 40%" │
└──────────────────────────────────────────────────────┘
```

##### **CODE MODE** (Technical Implementation)
```
┌─ IMPLEMENTATION PLANNING ───────────────────────────┐
│  Technical Requirements                              │
│  Integration Specifications                         │
│  Development Roadmap                                │
│                                                      │
│  AI Assistance:                                     │
│  • Technical research and best practices           │
│  • Implementation complexity analysis              │
│  • Security and compliance considerations          │
└──────────────────────────────────────────────────────┘
```

##### **ANALYZE MODE** 
```
┌─ PERFORMANCE & OPTIMIZATION ────────────────────────┐
│  Success Metrics Dashboard                          │
│  Performance Benchmarking                          │
│  Optimization Recommendations                      │
│                                                      │
│  AI Analysis:                                       │
│  • Priya: Performance data analysis                │
│  • Devon: Market response research                 │
│  • Content: Quality assessment                     │
└──────────────────────────────────────────────────────┘
```

---

## Right Panel Components  

### **4. RIGHT PANEL - NETWORK ACTIVITY & NEXT MOVES**

#### **4.1 NETWORK ACTIVITY FEED**
```
┌─ AI NETWORK ACTIVITY ───────────────────────────────┐
│  🧠 Maya (2 min ago)                                │
│     Strategic insight: ROI focus aligns with Q3     │
│     [ Apply ] [ Details ] [ Discuss ]               │
│                                                      │
│  🔍 Devon (15 min ago)                              │
│     Research: 67% of PMs struggle with data         │
│     [ Citation ] [ More Data ] [ Save ]             │
│                                                      │
│  📊 Priya (1 hr ago)                                │
│     Distribution: Tuesday 10am optimal posting      │
│     [ Schedule ] [ Test ] [ Modify ]                │
│                                                      │
│  [ View All Activity ] [ Filter ] [ Export ]       │
└──────────────────────────────────────────────────────┘
```

#### **4.2 SUGGESTED NEXT MOVES**
```
┌─ SUGGESTED NEXT MOVES ──────────────────────────────┐
│  🎯 High Priority (92% confidence)                  │
│     Complete intro section with ROI focus           │
│     [ Start ] [ Modify ] [ Skip ]                   │
│                                                      │
│  📝 Medium Priority (78% confidence)                │
│     Add customer success example                    │
│     [ + ] [ Details ] [ Later ]                     │
│                                                      │
│  🔍 Research Opportunity (85% confidence)           │
│     Gather competitive positioning data             │
│     [ Research ] [ Assign ] [ Skip ]                │
│                                                      │
│  [ Customize Suggestions ] [ Feedback ]             │
└──────────────────────────────────────────────────────┘
```

---

## Modal/Overlay Interfaces

### **5. SPECIALIZED INTERFACES**

#### **5.1 TRUST CALIBRATION MODAL**
```
┌─ TRUST SETTINGS ────────────────────────────────────┐
│                                                      │
│  Maya (Strategy): ●●●●○ High Autonomy               │
│  ├─ Auto-apply suggestions above 80% confidence     │
│  ├─ Strategic decisions: Show options               │
│  └─ Brand voice: Always require approval            │
│                                                      │
│  Devon (Research): ●●●○○ Medium Autonomy            │
│  ├─ Auto-cite sources above 85% confidence          │
│  ├─ Fact checking: Automatic with flagging          │
│  └─ Statistical claims: Always verify               │
│                                                      │
│  [ Save Settings ] [ Reset to Defaults ] [ Help ]  │
└──────────────────────────────────────────────────────┘
```

#### **5.2 CONTEXT MANAGEMENT MODAL**
```
┌─ CONTEXT MANAGEMENT ────────────────────────────────┐
│                                                      │
│ Current Context: 7 decisions loaded                 │
│                                                      │
│ ✓ ROI positioning strategy (Week 3) - High relevance│
│ ✓ Blog format selection (Week 2) - High relevance  │
│ ✓ Tuesday timing pattern (Week 5) - Medium relevance│
│ ✗ Customer story approach (Week 1) - Low relevance │
│                                                      │
│ Context Scope:                                      │
│ ◉ Current Project    ○ Project Family   ○ All Time │
│                                                      │      
│ [ Update Context ] [ Add Context ] [ Export ]      │
└──────────────────────────────────────────────────────┘
```

---

**Status:** Complete site architecture framework designed - ready for development priority planning and implementation roadmap.

**Next:** Determine which sections/features to build first for user validation testing.