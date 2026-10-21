package domains

import (
	"time"
)

type Chain struct {
	Id              int            `json:"id"`
	OccuredAt       time.Time      `json:"occured_at"`
	ActivatingEvent string         `json:"activating_event"`
	Response        string         `json:"response"`
	FutureAction    string         `json:"future_action"`
	Goal            string         `json:"goal"`
	Explanations    []*Explanation `json:"explanations"`
	Beliefs         []*Belief      `json:"beliefs"`
	Emotions        []*Emotion     `json:"emotions"`
}

type Explanation struct {
	Id          int    `json:"id"`
	Description string `json:"description"`
	IsRealistic bool   `json:"is_realistic"`
}

type Belief struct {
	Id                      int              `json:"id"`
	Desctiption             string           `json:"description"`
	BelievabilityBefore     string           `json:"believability_before"`
	BelievabilityAfter      string           `json:"believability_after"`
	Arguments               []*Argument      `json:"arguments"`
	RationalThoughtOfBelief *RationalThought `json:"rational_thought"`
}

type Argument struct {
	Id          int    `json:"id"`
	Description string `json:"description"`
	IsPositive  bool   `json:"is_positive"`
}

type RationalThought struct {
	Id            int    `json:"id"`
	Description   string `json:"description"`
	Believability string `json:"believability"`
}

type Emotion struct {
	Id              int    `json:"id"`
	EmotionType     string `json:"emotion_type"`
	Description     string `json:"description"`
	IntensityBefore string `json:"intensity_before"`
	IntensityAfter  string `json:"intensity_after"`
}
