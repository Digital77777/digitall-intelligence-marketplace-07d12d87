-- Transfer all marketplace listings from old system account to @DIM_Earn
UPDATE marketplace_listings 
SET user_id = 'fce177b9-604d-4e7c-b904-5f18ccf1ec73'
WHERE user_id = '04813cca-d8cf-4a63-b1f5-02b40d99d157';