CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email_hash VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'brand') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Board game
CREATE TABLE boardgames (
    boardgame_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    age_group VARCHAR(50),
    min_players INT,
    max_players INT,
    min_play_time INT, -- in minutes
    max_play_time INT, -- in minutes
    complexity_rating DECIMAL(3,2), -- 1.00 to 5.00 complexity score
    avatar_url VARCHAR(255) DEFAULT NULL, -- URL to the game's avatar
    background_image_url VARCHAR(255) DEFAULT NULL, -- URL to the background image
    boardgamegeek_url VARCHAR(255) DEFAULT NULL, -- Link to BoardGameGeek
    image_urls TEXT DEFAULT NULL,
    rule_urls TEXT DEFAULT NULL,
    is_approved BOOLEAN DEFAULT FALSE, -- Approval status by admin
    created_by INT NOT NULL, -- User who created the entry
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE gamepieces (
    gamepiece_id INT AUTO_INCREMENT PRIMARY KEY,
    boardgame_id INT NOT NULL, -- The board game this piece belongs to
    name VARCHAR(255) NOT NULL, -- Name of the gamepiece
    type ENUM('card', 'token', 'pawn', 'tile', 'custom') DEFAULT 'custom', -- Type of gamepiece
    quantity INT DEFAULT 1, -- Number of this type in the game
    description TEXT DEFAULT NULL, -- Description of the gamepiece
    image_url VARCHAR(255) DEFAULT NULL, -- URL to the image of the gamepiece
    FOREIGN KEY (boardgame_id) REFERENCES boardgames(boardgame_id) ON DELETE CASCADE
);


CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
    description VARCHAR(255)
);

CREATE TABLE boardgame_categories (
    boardgame_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (boardgame_id, category_id),
    FOREIGN KEY (boardgame_id) REFERENCES boardgames(boardgame_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

CREATE TABLE mechanics (
    mechanic_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE boardgame_mechanics (
    boardgame_id INT NOT NULL,
    mechanic_id INT NOT NULL,
    PRIMARY KEY (boardgame_id, mechanic_id),
    FOREIGN KEY (boardgame_id) REFERENCES boardgames(boardgame_id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(mechanic_id) ON DELETE CASCADE
);

CREATE TABLE contributors (
    contributor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role ENUM('publisher', 'designer', 'artist') NOT NULL, -- Role of the contributor
    bio TEXT, -- Optional biography
    country VARCHAR(100), -- Optional country information
    founded_year INT, -- Optional (only applies to publishers)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE boardgame_contributors (
    boardgame_id INT NOT NULL,
    contributor_id INT NOT NULL,
    role ENUM('publisher', 'designer', 'artist') NOT NULL, 
    PRIMARY KEY (boardgame_id, contributor_id, role), 
    FOREIGN KEY (boardgame_id) REFERENCES boardgames(boardgame_id) ON DELETE CASCADE,
    FOREIGN KEY (contributor_id) REFERENCES contributors(contributor_id) ON DELETE CASCADE
);

CREATE TABLE boardgame_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    boardgame_id INT NOT NULL,
    admin_id INT NOT NULL, -- Admin performing the review
    comments TEXT,
    is_approved BOOLEAN DEFAULT FALSE, -- Approval status
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (boardgame_id) REFERENCES boardgames(boardgame_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);


-- physical board game




-- physical board game

CREATE TABLE physical_boardgames (
    listing_id INT AUTO_INCREMENT PRIMARY KEY,
    boardgame_id INT NOT NULL, -- Links to the main boardgames table
    seller_id INT NOT NULL, -- The seller
    title VARCHAR(255) NOT NULL, -- Custom title for the listing
    description TEXT NOT NULL, -- Description of the item
    condition_product ENUM('new', 'like new', 'used') NOT NULL, -- Item condition
    price DECIMAL(10, 2) NOT NULL, -- Price set by the seller
    location VARCHAR(255), -- Location of the seller
    amount INT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE, -- Whether the item is still available
    image_urls TEXT DEFAULT NULL, -- JSON array of image URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (boardgame_id) REFERENCES boardgames(boardgame_id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE
);


CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL, -- Links to the listing being sold
    buyer_id INT NOT NULL, -- Buyer who purchased the item
    seller_id INT NOT NULL, -- Seller of the item
    price DECIMAL(10, 2) NOT NULL, -- Final price of the transaction
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES physical_boardgames(listing_id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL, -- Links to the completed transaction
    reviewer_id INT NOT NULL, -- User who left the review
    reviewee_id INT NOT NULL, -- User being reviewed
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), -- 1 to 5 stars
    comment TEXT DEFAULT NULL, -- Optional review text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE favorites (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- The user marking the listing as favorite
    listing_id INT NOT NULL, -- The listing being marked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES physical_boardgames(listing_id) ON DELETE CASCADE
);

