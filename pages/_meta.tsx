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
  Search,
  Zap,
} from 'lucide-react'

const navStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px', 
  fontWeight: 600,
  color: 'rgb(9, 9, 11)'
}

export default {
  "index": {
    title: (
      <span style={navStyle}>
        <BookOpen size={16} />
        Introduction
      </span>
    )
  },
  "blog": {
    title: "Blog",
    type: "page",
    href: "https://blog.runreveal.com/",
    newWindow: true
  },
  "changelog": {
    title: "Changelog",
    type: "page",
    href: "https://runreveal.com/changelog",
    newWindow: true
  },
  "contact": {
    title: "Contact",
    type: "page",
    href: "https://runreveal.com/contact",
    newWindow: true
  },
  "how-to-guides": {
    title: (
      <span style={navStyle}>
        <GraduationCap size={16} />
        How To Guides
      </span>
    )
  },
  "ai-chat": {
    title: (
      <span style={navStyle}>
        <MessageSquare size={16} />
        AI Chat
      </span>
    )
  },
  "dashboards": {
    title: (
      <span style={navStyle}>
        <LayoutTemplate size={16} />
        Dashboards & Graphs
      </span>
    )
  },
  "logs": {
    title: (
      <span style={navStyle}>
        <Search size={16} />
        Log Management
      </span>
    )
  },
  "sources": {
    title: (
      <span style={navStyle}>
        <Database size={16} />
        Sources
      </span>
    )
  },
  "detections": {
    title: (
      <span style={navStyle}>
        <Zap size={16} />
        Detections
      </span>
    )
  },
  "investigations": {
    title: (
      <span style={navStyle}>
        <Clipboard size={16} />
        Investigations
      </span>
    )
  },
  "notifications": {
    title: (
      <span style={navStyle}>
        <Bell size={16} />
        Notifications
      </span>
    )
  },
  "integrations": {
    title: (
      <span style={navStyle}>
        <Link2 size={16} />
        Integrations
      </span>
    )
  },
  "reference": {
    title: (
      <span style={navStyle}>
        <BookOpen size={16} />
        Reference
      </span>
    )
  },
  "bring-your-own-cloud": {
    title: (
      <span style={navStyle}>
        <Cloud size={16} />
        Bring Your Own Cloud
      </span>
    )
  },
  "glossary": {
    title: (
      <span style={navStyle}>
        <BookText size={16} />
        Glossary
      </span>
    )
  },
  "release-notes": {
    display: "hidden"
  }
}
