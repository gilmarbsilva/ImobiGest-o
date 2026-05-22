-- Adicionar coluna photo_url na tabela properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS photo_url TEXT;
