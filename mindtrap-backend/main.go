package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/Ashymist/mindtrap/mindtrap-backend/dbutils"
	. "github.com/Ashymist/mindtrap/mindtrap-backend/domains"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	connString := "postgres://postgres:password@localhost:5433/postgres?sslmode=disable"

	db, err := sql.Open("postgres", connString)

	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}

	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"}
	router.Use(cors.New(config))

	router.GET("/chains", func(c *gin.Context) { GetChains(c, db) })
	router.GET("/chains/:id", func(c *gin.Context) { GetChain(c, db) })
	router.POST("/chains", func(c *gin.Context) { AddChain(c, db) })
	router.PUT("/chains/:id", func(c *gin.Context) { UpdateChain(c, db) })
	router.DELETE("/chains/:id", func(c *gin.Context) { DeleteChain(c, db) })

	router.Run("localhost:7000")
}

func GetChains(c *gin.Context, db *sql.DB) {
	query := c.DefaultQuery("query", "")
	doSortByDate := c.DefaultQuery("sort_by_time", "") == "true"

	chains, err := dbutils.GetChainsFromDb(db, query, doSortByDate)
	if err != nil {
		log.Println(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, chains)
}

func GetChain(c *gin.Context, db *sql.DB) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil {
		log.Println(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	chain, err := dbutils.GetChainFromDb(db, id)
	if err != nil {
		log.Println(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, chain)
}

func AddChain(c *gin.Context, db *sql.DB) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var chain Chain

	if err := c.BindJSON(&chain); err != nil {
		log.Println(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	addedChain, err := dbutils.AddNewChainToDb(db, ctx, chain)

	if err != nil {
		log.Println(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, addedChain)
}

func UpdateChain(c *gin.Context, db *sql.DB) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var chain Chain

	if err := c.BindJSON(&chain); err != nil {
		log.Println(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		log.Println(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	chain.Id = id

	err = dbutils.UpdateChainInDb(db, ctx, chain)

	if err != nil {
		log.Println(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

}

func DeleteChain(c *gin.Context, db *sql.DB) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		log.Println(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = dbutils.DeleteChainFromDb(db, ctx, id)
	if err != nil {
		log.Println(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
}
