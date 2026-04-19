const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://cimpxzafgxajvdshdtzn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpbXB4emFmZ3hhanZkc2hkdHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU3OTQxNSwiZXhwIjoyMDkyMTU1NDE1fQ.Vu-1az_TSVA1-mtL1h-6X4lYi1Yfn90zBf2sH26gaPw'
);

async function test() {
  const { data, error } = await supabase.from('tasks').insert({
    title: 'Test',
    user_id: '123e4567-e89b-12d3-a456-426614174000', // random uuid
    status: 'todo',
    priority: 'medium'
  }).select();
  console.log('Error:', error);
}

test();
