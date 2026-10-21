package main

import (
	"database/sql"
	"log"
	"net/http"

	//"context"
	//"time"

	"github.com/Ashymist/mindtrap/mindtrap-backend/dbutils"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	connString := "postgres://postgres:password@localhost:5433/postgres?sslmode=disable"

	//ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	//defer cancel()

	db, err := sql.Open("postgres", connString)

	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}

	router := gin.Default()

	router.GET("/chains", func(c *gin.Context) { GetChains(c, db) })

	router.Run("localhost:7000")
}

func GetChains(c *gin.Context, db *sql.DB) {
	query := c.DefaultQuery("query", "")
	doSortByDate := c.DefaultQuery("sort_by_time", "") == "true"

	chains, err := dbutils.GetChainsFromDb(db, query, doSortByDate)
	if err != nil {
		log.Fatal(err)
		return
	}

	c.JSON(http.StatusOK, chains)
}
