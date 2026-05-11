-- Migration: Convert full country names to ISO codes in users table
UPDATE users SET country = 'AR' WHERE country = 'Argentina';
UPDATE users SET country = 'UY' WHERE country = 'Uruguay';
UPDATE users SET country = 'BR' WHERE country = 'Brazil';
UPDATE users SET country = 'ES' WHERE country = 'Spain';
UPDATE users SET country = 'GE' WHERE country = 'Georgia';
UPDATE users SET country = 'TH' WHERE country = 'Thailand';
UPDATE users SET country = 'RU' WHERE country = 'Russia';
UPDATE users SET country = 'WW' WHERE country = 'Rest of the World' OR country = '';
