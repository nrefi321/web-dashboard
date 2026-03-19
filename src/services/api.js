export async function fetchResults(){

  const res = await fetch('/api/v_bot/ai-result/')
  const data = await res.json()

  return data
}