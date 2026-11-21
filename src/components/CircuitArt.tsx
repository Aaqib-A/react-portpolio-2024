/**
 * The resume PDF's faint circuit artwork: one cluster hangs from the top right of the page, the other
 * sits centred on its bottom edge. Place it inside a `relative` element; it paints behind that element's content.
 */
export function CircuitArt({ at }: { at: 'top' | 'bottom' }) {
  return (
    <div
      aria-hidden="true"
      className={
        at === 'top'
          ? 'circuit circuit-top top-0 right-[2.5%] w-[min(55vw,40rem)]'
          : 'circuit circuit-bottom bottom-0 left-1/2 w-[min(53vw,40rem)] -translate-x-1/2'
      }
    />
  )
}
