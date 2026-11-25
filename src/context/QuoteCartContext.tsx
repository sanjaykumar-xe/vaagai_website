import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'vaagai_quote_cart_v1'

export interface QuoteCartItem {
  productId: string
  variantId: string | null
  quantity: number
}

interface QuoteCartContextValue {
  items: QuoteCartItem[]
  totalLines: number
  totalUnits: number
  addItem: (productId: string, variantId: string | null, quantity?: number) => void
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void
  removeItem: (productId: string, variantId: string | null) => void
  clearCart: () => void
}

const QuoteCartContext = createContext<QuoteCartContextValue | undefined>(undefined)

function loadStoredCart(): QuoteCartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item): item is QuoteCartItem =>
          item &&
          typeof item.productId === 'string' &&
          (item.variantId === null || typeof item.variantId === 'string') &&
          typeof item.quantity === 'number' &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0,
      )
      .map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: Math.min(999, Math.max(1, item.quantity)),
      }))
  } catch {
    return []
  }
}

export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteCartItem[]>(() => loadStoredCart())

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [items])

  const addItem = useCallback(
    (productId: string, variantId: string | null, quantity = 1) => {
      const safeQty = Math.min(999, Math.max(1, Math.floor(quantity)))
      setItems((prev) => {
        const existingIdx = prev.findIndex(
          (i) => i.productId === productId && i.variantId === variantId,
        )
        if (existingIdx >= 0) {
          return prev.map((item, idx) =>
            idx === existingIdx
              ? { ...item, quantity: Math.min(999, item.quantity + safeQty) }
              : item,
          )
        }
        return [...prev, { productId, variantId, quantity: safeQty }]
      })
    },
    [],
  )

  const updateQuantity = useCallback(
    (productId: string, variantId: string | null, quantity: number) => {
      const safeQty = Math.floor(quantity)
      if (safeQty <= 0) {
        setItems((prev) =>
          prev.filter((i) => !(i.productId === productId && i.variantId === variantId)),
        )
        return
      }
      setItems((prev) =>
        prev.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: Math.min(999, safeQty) }
            : item,
        ),
      )
    },
    [],
  )

  const removeItem = useCallback((productId: string, variantId: string | null) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId)),
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalLines = items.length
  const totalUnits = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  return (
    <QuoteCartContext.Provider
      value={{
        items,
        totalLines,
        totalUnits,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </QuoteCartContext.Provider>
  )
}

export function useQuoteCart(): QuoteCartContextValue {
  const ctx = useContext(QuoteCartContext)
  if (!ctx) {
    throw new Error('useQuoteCart must be used within a QuoteCartProvider')
  }
  return ctx
}
