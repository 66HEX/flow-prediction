---
layout: default
title: Advanced Usage
nav_order: 4
---

# Advanced Usage

{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Custom Preloading Logic

You can implement custom preloading logic by providing a `customFetch` function:

```tsx
<PreloadableLink
  href="/api/data"
  customFetch={async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    store.preloadData(data);  // Store in your state management
    return data;
  }}
>
  Load Data
</PreloadableLink>
```

## Dynamic Priority Adjustment

Adjust preload priorities based on application state:

```tsx
const MyNavigation = () => {
  const { currentSection } = useAppContext();
  
  return (
    <nav>
      {navItems.map(item => (
        <PreloadableLink
          key={item.path}
          href={item.path}
          // Higher priority for items related to current section
          priority={item.section === currentSection ? 10 : 5}
        >
          {item.label}
        </PreloadableLink>
      ))}
    </nav>
  );
};
```

## Integration with Routing Libraries

### Next.js

```tsx
import { useRouter } from 'next/router';
import { PreloadableLink } from 'flow-prediction';

const NextLink = ({ href, children, ...props }) => {
  const router = useRouter();
  
  const handleClick = (e) => {
    e.preventDefault();
    router.push(href);
  };
  
  return (
    <PreloadableLink 
      href={href}
      onClick={handleClick}
      {...props}
    >
      {children}
    </PreloadableLink>
  );
};
```

### React Router

```tsx
import { useNavigate } from 'react-router-dom';
import { PreloadableLink } from 'flow-prediction';

const RouterLink = ({ to, children, ...props }) => {
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
  };
  
  return (
    <PreloadableLink 
      href={to}
      onClick={handleClick}
      {...props}
    >
      {children}
    </PreloadableLink>
  );
};
```