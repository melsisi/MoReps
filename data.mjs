export const PROFILE = {
  startingWeight: null, proteinTarget: 120,
  equipment: 'FitRx · 60 lb set', dailyMinutes: 60,
};

export const EXERCISES = {
  squat: { name: 'Goblet squat', short: 'Goblet squat', move: 'squat', muscle: 'Quads · glutes', min: 10, max: 20, sets: 3, weighted: true, factor: 1, unit: 'lb · one dumbbell', cues: ['Hold one dumbbell close to your chest.', 'Sit down between your hips; keep heels grounded.', 'Stand tall without snapping your knees.'], tip: 'Choose a depth you can control without pain.' },
  floorpress: { name: 'Dumbbell floor press', short: 'Floor press', move: 'floorpress', muscle: 'Chest · triceps', min: 8, max: 15, sets: 3, weighted: true, factor: 2, unit: 'lb · per dumbbell', cues: ['Lie on the floor with knees bent and feet planted.', 'Keep elbows roughly 30–60° from your torso.', 'Lower gently until upper arms touch the floor, then press.'], tip: 'Two dumbbells. No bench needed.' },
  row: { name: 'One-arm dumbbell row', short: 'Dumbbell row', move: 'row', muscle: 'Back · biceps', min: 10, max: 20, sets: 3, weighted: true, factor: 2, unit: 'lb · one dumbbell', each: true, cues: ['Use a staggered stance; brace your free hand on your thigh.', 'Keep your back steady and pull your elbow toward your hip.', 'Lower with control; complete both sides before logging.'], tip: 'The rep count is per side. Finish both sides for one set.' },
  rdl: { name: 'Dumbbell Romanian deadlift', short: 'Romanian deadlift', move: 'hinge', muscle: 'Hamstrings · glutes', min: 10, max: 20, sets: 3, weighted: true, factor: 2, unit: 'lb · per dumbbell', cues: ['Keep knees softly bent and dumbbells near your legs.', 'Push your hips back while keeping your spine steady.', 'Stop at your comfortable hamstring stretch; stand tall.'], tip: 'Depth comes from your hips, not rounding your back.' },
  overhead: { name: 'Standing overhead press', short: 'Overhead press', move: 'overhead', muscle: 'Shoulders · triceps', min: 8, max: 15, sets: 2, weighted: true, factor: 2, unit: 'lb · per dumbbell', cues: ['Start with dumbbells beside your shoulders.', 'Brace your abdomen and keep your ribs from flaring.', 'Press overhead within your comfortable range.'], tip: 'Keep your lower back quiet. Use a lighter load if needed.' },
  curl: { name: 'Dumbbell curl', short: 'Biceps curl', move: 'curl', muscle: 'Biceps', min: 10, max: 20, sets: 2, weighted: true, factor: 2, unit: 'lb · per dumbbell', cues: ['Stand tall with arms beside your torso.', 'Curl without swinging your hips or shoulders.', 'Lower slowly; keep your wrists comfortable.'], tip: 'A controlled rep beats a heavier swing.' },
  split: { name: 'Stationary split squat', short: 'Split squat', move: 'split', muscle: 'Quads · glutes', min: 8, max: 15, sets: 3, weighted: true, factor: 4, unit: 'lb · per dumbbell', each: true, cues: ['Take a split stance with both feet on the ground.', 'Lower your back knee toward the ground under control.', 'Drive through your front foot; complete both sides.'], tip: 'Start with bodyweight if balance is the challenge.' },
  lateral: { name: 'Dumbbell lateral raise', short: 'Lateral raise', move: 'lateral', muscle: 'Side shoulders', min: 12, max: 20, sets: 2, weighted: true, factor: 2, unit: 'lb · per dumbbell', cues: ['Use very light dumbbells with a soft elbow bend.', 'Raise arms out to the sides up to shoulder height.', 'Lower without shrugging or swinging.'], tip: 'Unloaded handles are fine if plates are too heavy.' },
  sideplank: { name: 'Side plank', short: 'Side plank', move: 'sideplank', muscle: 'Core', min: 20, max: 40, sets: 2, timed: true, each: true, cues: ['Place your elbow below your shoulder.', 'Lift your hips and keep a straight line through your body.', 'Breathe steadily. Complete the hold on both sides.'], tip: 'Bend your knees for an easier variation.' },
  ringrow: { name: 'Ring row', short: 'Ring row', move: 'ringrow', muscle: 'Back · biceps', min: 8, max: 15, sets: 3, cues: ['Keep feet planted and your body in a straight line.', 'Pull the rings toward your ribs without shrugging.', 'Lower slowly. Stand more upright to make it easier.'], tip: 'Use a reachable ring height with your feet supported.' },
  pushup: { name: 'Push-up', short: 'Push-up', move: 'pushup', muscle: 'Chest · triceps', min: 6, max: 20, sets: 3, cues: ['Brace your abdomen and keep your body in one line.', 'Lower your chest with elbows angled back.', 'Press up. Use a stable elevated surface if needed.'], tip: 'An incline is a progression tool, not a penalty.' },
  lunge: { name: 'Reverse lunge', short: 'Reverse lunge', move: 'lunge', muscle: 'Quads · glutes', min: 10, max: 20, sets: 3, each: true, cues: ['Step back and bend both knees under control.', 'Keep your front foot planted and torso comfortable.', 'Return to standing. Complete the reps on each side.'], tip: 'Hold a fixed support lightly if balance limits you.' },
  walkout: { name: 'Glute bridge heel walkout', short: 'Heel walkout', move: 'walkout', muscle: 'Hamstrings · glutes', min: 6, max: 10, sets: 2, cues: ['Lie down with knees bent and lift your hips.', 'Take small heel steps away, keeping hips controlled.', 'Walk heels back in. Out and back equals one rep.'], tip: 'A short walkout is enough to start.' },
  calf: { name: 'Supported single-leg calf raise', short: 'Calf raise', move: 'calf', muscle: 'Calves', min: 12, max: 25, sets: 2, each: true, cues: ['Hold a fixed support and stand on one foot.', 'Rise onto your toes without bouncing.', 'Lower fully and slowly; then change sides.'], tip: 'Use the ground. A step is not required.' },
  deadbug: { name: 'Dead bug', short: 'Dead bug', move: 'deadbug', muscle: 'Core', min: 6, max: 12, sets: 2, each: true, cues: ['Lie on your back with arms up and knees over hips.', 'Slowly extend the opposite arm and leg.', 'Keep your lower back comfortable and steady; alternate sides.'], tip: 'Shorten the reach if your back starts to arch.' },
};

export const WORKOUTS = {
  homeA: { id: 'homeA', title: 'Home strength A', headline: ['BUILD', 'MODE.'], place: 'At home', icon: 'home', color: 'lime', description: 'Big moves. Real progress. Your FitRx set, put to work.', exerciseIds: ['squat', 'floorpress', 'row', 'rdl', 'overhead', 'curl'], duration: '45–60', demo: 'squat' },
  homeB: { id: 'homeB', title: 'Home strength B', headline: ['GET', 'STRONGER.'], place: 'At home', icon: 'home', color: 'lime', description: 'Build your legs, back, and chest. One good rep at a time.', exerciseIds: ['split', 'floorpress', 'rdl', 'row', 'lateral', 'sideplank'], duration: '45–60', demo: 'split' },
  park: { id: 'park', title: 'Playground strength', headline: ['TAKE IT', 'OUTSIDE.'], place: 'The playground', icon: 'rings', color: 'orange', description: 'Fresh air. Rings. Bodyweight. Your neighborhood is your gym.', exerciseIds: ['ringrow', 'pushup', 'lunge', 'walkout', 'calf', 'deadbug'], duration: '40–55', demo: 'ringrow' },
};

export const WEEK = [
  { day: 'Mon', name: 'Monday', type: 'strength', workout: 'homeA', title: 'Home strength A', icon: 'dumbbell' },
  { day: 'Tue', name: 'Tuesday', type: 'volleyball', title: 'Volleyball', icon: 'ball', minutes: 120 },
  { day: 'Wed', name: 'Wednesday', type: 'recovery', title: 'Easy recovery', icon: 'leaf', minutes: 25 },
  { day: 'Thu', name: 'Thursday', type: 'strength', workout: 'homeB', title: 'Home strength B', icon: 'dumbbell' },
  { day: 'Fri', name: 'Friday', type: 'swim', title: 'Pool conditioning', icon: 'waves', minutes: 30 },
  { day: 'Sat', name: 'Saturday', type: 'strength', workout: 'park', title: 'Playground strength', icon: 'rings' },
  { day: 'Sun', name: 'Sunday', type: 'recovery', title: 'Rest & reset', icon: 'leaf', minutes: 25 },
];

export const SOURCES = [
  ['Resistance training guidance · ACSM (2026)', 'https://acsm.org/resistance-training-guidelines-update-2026/'],
  ['Protein & muscle growth · Morton et al.', 'https://pubmed.ncbi.nlm.nih.gov/28698222/'],
  ['Rest between sets · Singer et al.', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11349676/'],
  ['FitRx 60 lb set & manual', 'https://fitrxrecovery.com/product/fitrx-smartbell-total-body-gym-60lbs/'],
];
