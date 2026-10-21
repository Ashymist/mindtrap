package domains

import (
	"time"
)

type Chain struct {
	Id              int
	OccuredAt       time.Time
	ActivatingEvent string
	Response        string
	FutureAction    string
	Goal            string
	Explanations    []Explanation
	Beliefs         []Belief
	Emotions        []Emotion
}

type Explanation struct {
	Id          int
	Description string
	IsRealistic bool
}

type Belief struct {
	Id                      int
	BeliefType              string
	Desctiption             string
	BelievabilityBefore     string
	BelievabilityAfter      string
	Arguments               []Argument
	RationalThoughtOfBelief RationalThought
}

type Argument struct {
	Id          int
	Description string
	IsPositive  bool
}

type RationalThought struct {
	Id            int
	Description   string
	Believability string
}

type Emotion struct {
	Id                int
	EmotionType       string
	Description       string
	isHealthy         bool
	IntensivityBefore string
	IntensivityAfter  string
}
