package dbutils

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	. "github.com/Ashymist/mindtrap/mindtrap-backend/domains"
)

type rowData struct {
	EventID                      int64
	OccuredAt                    time.Time
	ActivatingEvent              string
	Response                     *string
	FutureAction                 *string
	Goal                         *string
	BeliefID                     *int64
	BeliefEventID                *int64
	BeliefDescription            *string
	BeliefBelievabilityBefore    *string
	BeliefBelievabilityAfter     *string
	EmotionID                    *int64
	EmotionEventID               *int64
	EmotionType                  *string
	EmotionDescription           *string
	EmotionIntensityBefore       *string
	EmotionIntensityAfter        *string
	RationalThoughtID            *int64
	RationalThoughtBeliefID      *int64
	RationalThoughtDescription   *string
	RationalThoughtBelievability *string
	ArgumentId                   *int64
	ArgumentBeliefID             *int64
	ArgumentDescription          *string
	ArgumentIsPositive           *bool
	ExplanationID                *int64
	ExplanationEventID           *int64
	ExplanationDescription       *string
	ExplanationIsRealistic       *bool
}

func AddNewChainToDb(db *sql.DB, ctx context.Context, chain Chain) (*Chain, error) {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		log.Println(err)
	}
	defer tx.Rollback()
	fmt.Println(chain.OccuredAt, chain.ActivatingEvent, chain.Response, chain.FutureAction, chain.Goal)

	// --create inital event
	createdChain := Chain{}
	eventId := 0

	occuredAt := chain.OccuredAt
	activatingEvent := chain.ActivatingEvent
	response := chain.Response

	if occuredAt.IsZero() || activatingEvent == "" || response == "" {
		return nil, errors.New("Bad request")
	}
	var newId int
	err = tx.QueryRow(`INSERT INTO events (occured_at,activating_event,response) VALUES ($1,$2,$3) RETURNING event_id`, occuredAt, activatingEvent, response).Scan(&newId)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	eventId = int(newId)
	createdChain.Id = eventId
	createdChain.ActivatingEvent = activatingEvent
	createdChain.OccuredAt = chain.OccuredAt
	createdChain.Response = response

	// -- future action check
	futureAction := chain.FutureAction
	if len(futureAction) != 0 {
		_, err := tx.Exec(`UPDATE events SET future_action=$1 WHERE event_id=$2`, futureAction, eventId)
		if err != nil {
			log.Println(err)
			return nil, err
		}
	}
	//

	createdChain.FutureAction = futureAction

	// ---goal checking ---

	goal := chain.Goal
	if len(goal) != 0 {
		_, err := tx.Exec(`UPDATE events SET goal=$1 WHERE event_id=$2`, goal, eventId)
		if err != nil {
			log.Println(err)
			return nil, err
		}
	}

	createdChain.Goal = goal

	// ---
	// beliefs checking
	newBeliefs := []*Belief{}
	beliefs := chain.Beliefs
	for _, belief := range beliefs {
		if belief != nil {
			// create init belief
			var newBeliefId int
			err := tx.QueryRow(`INSERT INTO beliefs (event_id,description, believability_before) VALUES ($1,$2,$3) RETURNING belief_id`, eventId, belief.Desctiption, belief.BelievabilityBefore).Scan(&newBeliefId)
			if err != nil {
				log.Println(err)
				return nil, err
			}

			// check if believability after is not nil
			believabilityAfter := belief.BelievabilityAfter
			if len(believabilityAfter) != 0 {
				_, err := tx.Exec(`UPDATE beliefs SET believability_after=$1 WHERE belief_id=$2`, believabilityAfter, newBeliefId)
				if err != nil {
					log.Println(err)
					return nil, err
				}
			}

			// go through every argument
			newArguments := []*Argument{}
			for _, argument := range belief.Arguments {
				if argument != nil {
					var newArgumentId int
					err := tx.QueryRow(`INSERT INTO arguments (belief_id,description, is_positive) VALUES ($1,$2,$3) RETURNING argument_id`, newBeliefId, argument.Description, argument.IsPositive).Scan(&newArgumentId)
					if err != nil {
						log.Println(err)
						return nil, err
					}

					newArguments = append(newArguments, &Argument{Id: int(newArgumentId), Description: argument.Description, IsPositive: argument.IsPositive})
				}
			}

			// check if rational thought is present
			rationalThought := belief.RationalThoughtOfBelief
			if rationalThought != nil {
				var newRationalThoughtId int
				err := tx.QueryRow(`INSERT INTO rational_thoughts (belief_id,description, believability) VALUES ($1,$2,$3) RETURNING thought_id`, newBeliefId, rationalThought.Description, rationalThought.Believability).Scan(&newRationalThoughtId)
				if err != nil {
					log.Println(err)
					return nil, err
				}
				rationalThought = &RationalThought{Id: int(newRationalThoughtId), Description: rationalThought.Description, Believability: rationalThought.Believability}
			}

			newBeliefs = append(newBeliefs, &Belief{Id: int(newBeliefId), Desctiption: belief.Desctiption, BelievabilityBefore: belief.BelievabilityBefore, BelievabilityAfter: belief.BelievabilityAfter, Arguments: newArguments, RationalThoughtOfBelief: rationalThought})

		}
	}

	createdChain.Beliefs = append(createdChain.Beliefs, newBeliefs...)
	// ---

	// -- explanations checking
	explanations := chain.Explanations

	addedExplanations := []*Explanation{}

	for _, explanation := range explanations {
		if explanation != nil {
			var newExplanationId int16
			err := tx.QueryRow(`INSERT INTO explanations (event_id, description, is_realistic) VALUES ($1,$2, $3) RETURNING explanation_id`, eventId, explanation.Description, explanation.IsRealistic).Scan(&newExplanationId)
			if err != nil {
				log.Println(err)
				return nil, err
			}
			addedExplanations = append(addedExplanations, &Explanation{Id: int(newExplanationId), Description: explanation.Description, IsRealistic: explanation.IsRealistic})
		}
	}

	createdChain.Explanations = append(createdChain.Explanations, addedExplanations...)
	// ---

	// emotions check
	addedEmotions := []*Emotion{}
	for _, emotion := range chain.Emotions {
		if emotion != nil {
			var newEmotionId int
			err := tx.QueryRow(`INSERT INTO emotions (event_id,emotion_type, description, intensity_before, intensity_after) VALUES ($1,$2,$3,$4,$5) RETURNING emotion_id`, eventId, emotion.EmotionType, emotion.Description, emotion.IntensityBefore, emotion.IntensityAfter).Scan(&newEmotionId)
			if err != nil {
				log.Println(err)
				return nil, err
			}

			addedEmotions = append(addedEmotions, &Emotion{Id: int(newEmotionId), EmotionType: emotion.EmotionType, Description: emotion.Description, IntensityBefore: emotion.IntensityBefore, IntensityAfter: emotion.IntensityAfter})
		}
	}

	createdChain.Emotions = append(createdChain.Emotions, addedEmotions...)
	tx.Commit()
	return &createdChain, nil
}

func DeleteChainFromDb(db *sql.DB, ctx context.Context, chainId int) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		log.Println(err)
		return err
	}
	defer tx.Rollback()
	var resultId int
	if err = tx.QueryRow(`SELECT event_id FROM events WHERE event_id = $1`, chainId).Scan(&resultId); err != nil {
		log.Println(err)
		return err
	}

	_, err = tx.Exec(`DELETE FROM events WHERE event_id = $1`, chainId)

	if err != nil {
		log.Println(err)
		return err
	}
	tx.Commit()
	return nil
}

func GetChainsFromDb(db *sql.DB, query string, sortByDate bool) ([]*Chain, error) {

	sqlQuery := `select * from events e
		left join beliefs b on b.event_id = e.event_id
		left join emotions em on em.event_id = e.event_id 
		left join rational_thoughts rt on rt.belief_id  = b.belief_id 
		left join arguments a on a.belief_id = b.belief_id 
		left join explanations exp on exp.event_id = e.event_id 
	where  exists (
		select 1 from emotions em2
		where em2.event_id = e.event_id and em2.emotion_type LIKE $1
	)`
	if sortByDate {
		sqlQuery += `order by e.occured_at DESC`
	}
	rows, err := db.Query(sqlQuery, "%"+query+"%")
	if err != nil {
		log.Println(err)
		return nil, err
	}
	// saving results of query in memory
	queryResult, err := extractQueryRows(rows)
	if err != nil {
		return nil, err
	}
	// extracting objects from rows
	chains := extractChainsFromQueryRows(queryResult)
	return chains, nil
}

func GetChainFromDb(db *sql.DB, id int) (*Chain, error) {
	sqlQuery := `select * from events e
		left join beliefs b on b.event_id = e.event_id
		left join emotions em on em.event_id = e.event_id 
		left join rational_thoughts rt on rt.belief_id  = b.belief_id 
		left join arguments a on a.belief_id = b.belief_id 
		left join explanations exp on exp.event_id = e.event_id 
	where  e.event_id  = $1`

	rows, err := db.Query(sqlQuery, id)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	// saving results of query in memory
	queryResult, err := extractQueryRows(rows)
	if err != nil {
		return nil, err
	}
	// extracting objects from rows
	chains := extractChainsFromQueryRows(queryResult)
	return chains[0], nil

}

func UpdateChainInDb(db *sql.DB, ctx context.Context, chain Chain) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		log.Println(err)
	}
	defer tx.Rollback()

	var resultId int
	if err = tx.QueryRow(`SELECT event_id FROM events WHERE event_id = $1`, chain.Id).Scan(&resultId); err != nil {
		log.Println(err)
		return err
	}
	// delete all children
	_, err = tx.Exec(`delete from beliefs b where event_id = $1`, resultId)
	if err != nil {
		log.Println(err)
		return err
	}
	_, err = tx.Exec(`delete from explanations e where e.event_id  = $1`, resultId)
	if err != nil {
		log.Println(err)
		return err
	}
	_, err = tx.Exec(`delete from emotions em where em.event_id = $1`, resultId)
	if err != nil {
		log.Println(err)
		return err
	}
	// create new children for chain
	occuredAt := chain.OccuredAt
	activatingEvent := chain.ActivatingEvent
	response := chain.Response

	if occuredAt.IsZero() || activatingEvent == "" || response == "" {
		return errors.New("Bad request")
	}

	_, err = tx.Exec(`UPDATE events SET occured_at=$1,activating_event=$2,response=$3 WHERE event_id=$4`, occuredAt, activatingEvent, response, resultId)
	if err != nil {
		log.Println(err)
		return err
	}

	// -- future action update

	_, err = tx.Exec(`UPDATE events SET future_action=$1 WHERE event_id=$2`, chain.FutureAction, resultId)
	if err != nil {
		log.Println(err)
		return err
	}

	//
	// ---goal update ---

	_, err = tx.Exec(`UPDATE events SET goal=$1 WHERE event_id=$2`, chain.Goal, resultId)
	if err != nil {
		log.Println(err)
		return err
	}

	// ---
	// beliefs checking
	beliefs := chain.Beliefs
	for _, belief := range beliefs {
		if belief != nil {
			// create init belief
			var newBeliefId int
			err := tx.QueryRow(`INSERT INTO beliefs (event_id,description, believability_before, believability_after) VALUES ($1,$2,$3,$4) RETURNING belief_id`, resultId, belief.Desctiption, belief.BelievabilityBefore, belief.BelievabilityAfter).Scan(&newBeliefId)
			if err != nil {
				log.Println(err)
				return err
			}
			// go through every argument

			for _, argument := range belief.Arguments {
				if argument != nil {
					_, err = tx.Exec(`INSERT INTO arguments (belief_id,description, is_positive) VALUES ($1,$2,$3)`, newBeliefId, argument.Description, argument.IsPositive)
					if err != nil {
						log.Println(err)
						return err
					}

				}
			}

			// check if rational thought is present
			rationalThought := belief.RationalThoughtOfBelief
			if rationalThought != nil {
				_, err = tx.Exec(`INSERT INTO rational_thoughts (belief_id,description, believability) VALUES ($1,$2,$3)`, newBeliefId, rationalThought.Description, rationalThought.Believability)
				if err != nil {
					log.Println(err)
					return err
				}
			}
		}
	}

	// ---

	// -- explanations checking
	explanations := chain.Explanations

	for _, explanation := range explanations {
		if explanation != nil {
			_, err = tx.Exec(`INSERT INTO explanations (event_id, description, is_realistic) VALUES ($1,$2, $3)`, resultId, explanation.Description, explanation.IsRealistic)
			if err != nil {
				log.Println(err)
				return err
			}
		}
	}

	for _, emotion := range chain.Emotions {
		if emotion != nil {
			_, err = tx.Exec(`INSERT INTO emotions (event_id,emotion_type, description, intensity_before, intensity_after) VALUES ($1,$2,$3,$4,$5)`, resultId, emotion.EmotionType, emotion.Description, emotion.IntensityBefore, emotion.IntensityAfter)
			if err != nil {
				log.Println(err)
				return err
			}
		}
	}

	tx.Commit()
	return nil
}

func extractChainsFromQueryRows(queryResult []rowData) []*Chain {
	chains := []*Chain{}
	chainIds := make(map[int64]*Chain)

	beliefIds := make(map[int64]*Belief)
	emotionIds := make(map[int64]*Emotion)
	rationalthtsIds := make(map[int64]*RationalThought)
	argumentIds := make(map[int64]*Argument)
	explanationIds := make(map[int64]*Explanation)

	for _, row := range queryResult {

		if _, ok := chainIds[row.EventID]; !ok {
			chain := &Chain{Id: int(row.EventID), OccuredAt: row.OccuredAt, ActivatingEvent: row.ActivatingEvent, Explanations: []*Explanation{}, Beliefs: []*Belief{}, Emotions: []*Emotion{}}
			if row.Response != nil {
				chain.Response = *row.Response
			}
			if row.FutureAction != nil {
				chain.FutureAction = *row.FutureAction
			}
			if row.Goal != nil {
				chain.Goal = *row.Goal
			}
			chains = append(chains, chain)
			chainIds[row.EventID] = chain
		}
		if row.BeliefID != nil {
			if _, ok := beliefIds[*row.BeliefID]; !ok {
				belief := &Belief{Id: int(*row.BeliefID), Desctiption: *row.BeliefDescription, BelievabilityBefore: *row.BeliefBelievabilityBefore, Arguments: []*Argument{}}
				if row.BeliefBelievabilityAfter != nil {
					belief.BelievabilityAfter = *row.BeliefBelievabilityAfter
				}
				beliefIds[*row.BeliefID] = belief
				chainIds[row.EventID].Beliefs = append(chainIds[row.EventID].Beliefs, belief)
			}
		}

		if row.EmotionID != nil {
			if _, ok := emotionIds[*row.EmotionID]; !ok {
				emotion := &Emotion{Id: int(*row.EmotionID), EmotionType: *row.EmotionType, IntensityBefore: *row.EmotionIntensityBefore}
				if row.EmotionDescription != nil {
					emotion.Description = *row.EmotionDescription
				}
				if row.EmotionIntensityAfter != nil {
					emotion.IntensityAfter = *row.EmotionIntensityAfter
				}
				emotionIds[*row.EmotionID] = emotion
				chainIds[row.EventID].Emotions = append(chainIds[row.EventID].Emotions, emotion)
			}
		}

		if row.RationalThoughtID != nil {
			if _, ok := rationalthtsIds[*row.RationalThoughtID]; !ok {
				rationaltht := &RationalThought{Id: int(*row.RationalThoughtID), Description: *row.RationalThoughtDescription, Believability: *row.RationalThoughtBelievability}
				rationalthtsIds[*row.RationalThoughtID] = rationaltht
				beliefIds[*row.RationalThoughtBeliefID].RationalThoughtOfBelief = rationaltht
			}
		}

		if row.ArgumentId != nil {
			if _, ok := argumentIds[*row.ArgumentId]; !ok {
				argument := &Argument{Id: int(*row.ArgumentId), Description: *row.ArgumentDescription, IsPositive: *row.ArgumentIsPositive}
				argumentIds[*row.ArgumentId] = argument
				beliefIds[*row.ArgumentBeliefID].Arguments = append(beliefIds[*row.ArgumentBeliefID].Arguments, argument)
			}
		}

		if row.ExplanationID != nil {
			if _, ok := explanationIds[*row.ExplanationID]; !ok {
				explanation := &Explanation{Id: int(*row.ExplanationID), Description: *row.ExplanationDescription}
				if row.ExplanationIsRealistic != nil {
					explanation.IsRealistic = *row.ExplanationIsRealistic
				}
				explanationIds[*row.ExplanationID] = explanation
				chainIds[row.EventID].Explanations = append(chainIds[row.EventID].Explanations, explanation)
			}
		}
	}

	return chains
}

func extractQueryRows(rows *sql.Rows) ([]rowData, error) {

	queryResult := []rowData{}
	var row rowData
	for rows.Next() {
		if err := rows.Scan(
			&row.EventID,
			&row.OccuredAt,
			&row.ActivatingEvent,
			&row.Response,
			&row.FutureAction,
			&row.Goal,
			&row.BeliefID,
			&row.BeliefEventID,
			&row.BeliefDescription,
			&row.BeliefBelievabilityBefore,
			&row.BeliefBelievabilityAfter,
			&row.EmotionID,
			&row.EmotionEventID,
			&row.EmotionType,
			&row.EmotionDescription,
			&row.EmotionIntensityBefore,
			&row.EmotionIntensityAfter,
			&row.RationalThoughtID,
			&row.RationalThoughtBeliefID,
			&row.RationalThoughtDescription,
			&row.RationalThoughtBelievability,
			&row.ArgumentId,
			&row.ArgumentBeliefID,
			&row.ArgumentDescription,
			&row.ArgumentIsPositive,
			&row.ExplanationID,
			&row.ExplanationEventID,
			&row.ExplanationDescription,
			&row.ExplanationIsRealistic,
		); err != nil {
			log.Println(err)
			return nil, err
		}

		if err := rows.Err(); err != nil {
			log.Println(err)
			return nil, err
		}
		queryResult = append(queryResult, row)

	}
	return queryResult, nil
}
