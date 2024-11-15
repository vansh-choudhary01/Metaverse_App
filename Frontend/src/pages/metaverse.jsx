import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const Metaverse = () => {
  const gameContainerRef = useRef(null);

  useEffect(() => {
    // Phaser game configuration
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }, // No vertical gravity
          debug: false,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
      parent: gameContainerRef.current,
    };

    let game = new Phaser.Game(config);
    let player, platforms, tables, cursors;

    // Preload ..assets
    function preload() {
      this.load.image('sky', './assets/metaverse.jpg');
      this.load.image('table', './assets/grayline.png');
      this.load.image('border', './assets/grayline.png');
      this.load.spritesheet('dude', './assets/character.png', {
        frameWidth: 400,
        frameHeight: 599,
      });
    }

    // Create the game scene
    function create() {
        // Add background image
        this.add.image(650, 300, 'sky');

        platforms = this.physics.add.staticGroup(); // Static group for non-moving objects

        // Furniture and decorative elements
        platforms.create(350, 220, 'border').setScale(0.2, 0.08).refreshBody();
        platforms.create(450, 150, 'border').setScale(0.05, 0.1).refreshBody();
        platforms.create(450, 280, 'border').setScale(0.05, 0.18).refreshBody();
        platforms.create(200, 300, 'border').setScale(2, 0.08).refreshBody();
        platforms.create(340, 420, 'border').setScale(0.15, 0.08).refreshBody();
        platforms.create(450, 400, 'border').setScale(0.2, 0.08).refreshBody();
        platforms.create(410, 400, 'border').setScale(0, 0.7).refreshBody();
        platforms.create(390, 500, 'border').setScale(0.15, 0).refreshBody();
        platforms.create(280, 540, 'border').setScale(0.2, 0.2).refreshBody();
        platforms.create(850, 600, 'border').setScale(1.7, 0.7).refreshBody();
        platforms.create(1000, 300, 'border').setScale(0.2, 0.15).refreshBody();
        platforms.create(1000, 430, 'border').setScale(0.2, 0.18).refreshBody();

        // Create initial table and calculate its width
        const firstTable = platforms.create(544, 270, 'table').setScale(0.22, 0.1).refreshBody();
        const tableWidth = firstTable.displayWidth;
        tables = this.physics.add.staticGroup();

        // Generate rows of tables for seating areas
        buildTables(544, 270, 10, tableWidth, 3);
        buildTables(765, 270, 10, tableWidth, 3);
        buildTables(544, 420, 10, tableWidth, 3);
        buildTables(765, 420, 10, tableWidth, 3);

        // Create border boundaries around the screen edges
        platforms.create(0, 0, 'border').setScale(10, 1).refreshBody(); // Top border
        platforms.create(0, 600, 'border').setScale(10, 0.1).refreshBody(); // Bottom border
        platforms.create(0, 0, 'border').setScale(2, 10).refreshBody(); // Left border
        platforms.create(1280, 0, 'border').setScale(1.7, 10).refreshBody(); // Right border

        // Create player character sprite
        player = this.physics.add.sprite(500, 0, 'dude').setScale(0.1);
        player.setCollideWorldBounds(true); // Keep player within game bounds

        // Define animations for character movement
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('dude', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1
        });

        cursors = this.input.keyboard.createCursorKeys(); // Set up keyboard controls

        // Enable collision for player with platforms and tables
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(player, tables);
    }

    // Update function for handling game logic per frame
    function update() {
        // Check which arrow key is pressed and move player accordingly
        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play('right', true);
        } else if (cursors.up.isDown) {
            player.setVelocityY(-160);
            player.anims.play('up', true);
        } else if (cursors.down.isDown) {
            player.setVelocityY(160);
            player.anims.play('down', true);
        } else {
            // Stop player movement if no key is pressed
            player.setVelocity(0);
            player.anims.stop();
        }
    }

    // Helper function to create a row of tables
    function buildTables(x, y, distance, tableWidth, n) {
        for (let i = 0; i < n; i++) {
            tables.create(x + (i * (tableWidth + distance)), y, 'table').setScale(0.22, 0.1).refreshBody();
        }
    }

    // Cleanup Phaser game instance on component unmount
    return () => {
      if (game) {
        game.destroy(true);
      }
    };
  }, []);

  return <div style={{position : 'fixed'}} ref={gameContainerRef} />;
};

export default Metaverse;