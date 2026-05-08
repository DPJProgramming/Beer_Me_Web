-- MySQL schema for `beers` table
CREATE TABLE IF NOT EXISTS beers (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brewery VARCHAR(255),
    type VARCHAR(100),
    subType VARCHAR(100),
    description TEXT,
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    date DATE,
    updatedDate DATE,
    image VARCHAR(255),
    location VARCHAR(255),
    deleted TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;