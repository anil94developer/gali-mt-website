function ResultHistoryPage() {
  const cropTop = 110
  const cropBottom = 90

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100vh',
        background: '#fff',
        overflow: 'hidden',
      }}
    >
      <iframe
        title="Result History"
        src="https://playonlineds.net/Resulthistory"
        style={{
          width: '100%',
          height: `calc(100vh + ${cropTop + cropBottom}px)`,
          border: 'none',
          display: 'block',
          marginTop: `-${cropTop}px`,
        }}
      />
    </div>
  )
}

export default ResultHistoryPage
