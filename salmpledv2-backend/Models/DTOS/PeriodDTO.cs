
namespace salmpledv2_backend.Models.DTOS
{
    public class PeriodDTO
    {
        public DateTime PeriodStart {get;set;}

        public DateTime PeriodEnd {get;set;}

        public GetPackDTO Pack {get;set;}
        
    }
}