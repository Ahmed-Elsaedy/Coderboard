# UI Components Documentation

## Component Hierarchy

### Shared Components
```
📂 Components/Shared
├── 📄 Layout
│   ├── NavigationBar
│   ├── Sidebar
│   └── Footer
├── 📄 Authentication
│   ├── UserMenu
│   └── ProfilePicture
└── 📄 Common
    ├── Alert
    ├── LoadingSpinner
    ├── ConfirmDialog
    ├── Pagination
    ├── SearchBar
    └── FilterPanel
```

### Teacher Components
```
📂 Teacher
├── 📄 Dashboard
│   ├── DashboardLayout
│   │   ├── StatisticsSummary
│   │   ├── QuickActions
│   │   └── RecentActivity
│   └── LecturesList
│       ├── GridView
│       ├── ListView
│       └── LectureCard
├── 📄 LectureManagement
│   ├── LectureForm
│   ├── MetadataEditor
│   └── StatusManager
└── 📄 DrawingTools
    ├── CanvasContainer
    ├── ToolBar
    ├── ColorPicker
    └── AnimationControls
```

### Student Components
```
📂 Student
├── 📄 Dashboard
│   ├── DashboardLayout
│   │   ├── ProgressSummary
│   │   └── RecentActivity
│   └── LecturesCatalog
│       ├── SearchFilters
│       └── LecturePreviewCard
└── 📄 LectureViewer
    ├── AnimationPlayer
    ├── Controls
    └── NotePanel
```

## Component Details

### Shared/Layout
- **NavigationBar**
  - Purpose: Main navigation and user controls
  - Props:
    * `isAuthenticated: boolean`
    * `userRole: string`
  - Events:
    * `onLogout()`
    * `onNavigate(route)`

### Teacher/LecturesList
- **LectureCard**
  - Purpose: Display individual lecture information
  - Props:
    * `lecture: LectureModel`
    * `showActions: boolean`
  - Events:
    * `onEdit(lectureId)`
    * `onDelete(lectureId)`
    * `onPublish(lectureId)`

[... continue with other components ...]

## State Management
- Authentication state
- Current user context
- Active lecture context
- Drawing state
- Animation playback state

## Component Communication
- Parent-child props
- Events up
- Context/State management
- SignalR real-time updates

## Styling Strategy
- CSS Modules
- Theme variables
- Responsive design
- Accessibility compliance 