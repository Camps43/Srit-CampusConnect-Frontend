export function cn(...args) {
    return args.flatMap(a => {
      if (!a) return []
      if (typeof a === 'string') return a.split(' ')
      if (Array.isArray(a)) return a
      if (typeof a === 'object') return Object.keys(a).filter(k => a[k])
      return []
    }).join(' ')
  }
  