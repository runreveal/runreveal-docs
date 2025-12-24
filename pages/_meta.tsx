import {
  Bell,
  BookOpen,
  BookText,
  Cloud,
  Clipboard,
  Database,
  GraduationCap,
  LayoutTemplate,
  Link2,
  MessageSquare,
  Rocket,
  Search,
  Zap,
} from 'lucide-react'

export default {
  "index": {
    title: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookOpen size={16} />
        Introduction
      </span>
    )
  },
  "contact": {
    title: "Contact",
    type: "page",
    href: "https://runreveal.com/contact",
    newWindow: true
  },
  "how-to-guides": {
    title: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <GraduationCap size={16} />
        How To Guides
      </span>
    )
  },
  "ai-chat": {
    title: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={16} />
        AI Chat
      </span>
    )
  },
  "dashboards": {
    title: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <LayoutTemplate size={16} />
        Dashboards & Graphs
      </span>
    )
  },
  "logs": {
    title: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Search size={16} />
        Log Management
      </span>
    )
  },
  "sources": {
    title: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Database size={16} />
        Sources
      </span>
    )
  },
  "detections": {
    title: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Zap size={16} />
        Detections
      </span>
    )
  },
  "investigations": {
    title: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clipboard size={16} />
        Investigations
      </span>
    )
  },
  "notifications": {
    title: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Bell size={16} />
        Notifications
      </span>
    )
  },
  "integrations": {
    title: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link2 size={16} />
        Integrations
      </span>
    )
  },
  "reference": {
    title: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookOpen size={16} />
        Reference
      </span>
    )
  },
  "bring-your-own-cloud": {
    title: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Cloud size={16} />
        Bring Your Own Cloud
      </span>
    )
  },
  "glossary": {
    title: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookText size={16} />
        Glossary
      </span>
    )
  },
  "release-notes": {
    title: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Rocket size={16} />
        Release Notes
      </span>
    )
  }
}
