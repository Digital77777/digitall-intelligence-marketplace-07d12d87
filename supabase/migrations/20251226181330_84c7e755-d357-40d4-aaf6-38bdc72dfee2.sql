-- Delete messages where sender and receiver are the same (self-messages)
DELETE FROM public.messages 
WHERE sender_id = receiver_id;